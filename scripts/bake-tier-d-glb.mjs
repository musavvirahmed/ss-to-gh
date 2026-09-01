#!/usr/bin/env node
/**
 * PROTOTYPE — offline bake helper for tier D GLB.
 * Builds a textured ellipsoid bust from the portrait bake source (rectangular JPG).
 * Shape is placeholder geometry (not MICA/DECA/TripoSR); likeness bar is human-judged on #33.
 *
 * Usage:
 *   node scripts/bake-tier-d-glb.mjs --source /path/to/profile-picture-i-facebook.jpg
 *   node scripts/bake-tier-d-glb.mjs --source prototypes/tier-d-portrait/_private/bake-source.jpg
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { Document, NodeIO } from "@gltf-transform/core";
import { dedup, flatten } from "@gltf-transform/functions";
import { KHRMeshQuantization } from "@gltf-transform/extensions";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_OUT = path.join(ROOT, "prototypes/tier-d-portrait/assets/musa-head.glb");

function parseArgs(argv) {
  const args = { source: null, out: DEFAULT_OUT };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--source") args.source = argv[++i];
    else if (argv[i] === "--out") args.out = path.resolve(argv[++i]);
  }
  return args;
}

// Planar decal projection: where the head sits in the square bake texture
// (fractions of image size; V measured from the top, matching glTF UV space).
// Must match prototypes/tier-d-portrait/portrait-3d.js.
const HEAD_U_CENTER = 0.515;
const HEAD_V_CENTER = 0.4;
const HEAD_U_HALF = 0.3;
const HEAD_V_HALF = 0.34;

/** UV sphere → positions, normals, uvs, indices (head-sized ellipsoid). */
function buildEllipsoid(rx, ry, rz, stacks = 32, slices = 48) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= stacks; i++) {
    const v = i / stacks;
    const phi = v * Math.PI;
    for (let j = 0; j <= slices; j++) {
      const u = j / slices;
      const theta = u * Math.PI * 2;
      const x = rx * Math.sin(phi) * Math.cos(theta);
      const y = ry * Math.cos(phi);
      const z = rz * Math.sin(phi) * Math.sin(theta);
      positions.push(x, y, z);
      const nx = x / rx;
      const ny = y / ry;
      const nz = z / rz;
      const len = Math.hypot(nx, ny, nz) || 1;
      normals.push(nx / len, ny / len, nz / len);
      // Planar front projection (not spherical wrap): the face lands on the
      // front of the ellipsoid; rim/back sample the photo's red backdrop.
      uvs.push(HEAD_U_CENTER + (x / rx) * HEAD_U_HALF, HEAD_V_CENTER - (y / ry) * HEAD_V_HALF);
    }
  }

  const row = slices + 1;
  for (let i = 0; i < stacks; i++) {
    for (let j = 0; j < slices; j++) {
      const a = i * row + j;
      const b = a + row;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, b, d, b, c, d);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint32Array(indices),
  };
}

async function main() {
  const { source, out } = parseArgs(process.argv);
  if (!source) {
    console.error(`Missing --source (portrait bake source JPG).

Copy Drive profile-picture-i-facebook.jpg to:
  prototypes/tier-d-portrait/_private/bake-source.jpg

Then run:
  npm run bake:tier-d -- --source prototypes/tier-d-portrait/_private/bake-source.jpg`);
    process.exit(1);
  }

  const sourcePath = path.resolve(source);
  if (!fs.existsSync(sourcePath)) {
    console.error(`Source not found: ${sourcePath}`);
    process.exit(1);
  }

  const texBytes = await sharp(sourcePath)
    .resize(1024, 1024, { fit: "cover", position: "centre" })
    .jpeg({ quality: 88 })
    .toBuffer();

  const { positions, normals, uvs, indices } = buildEllipsoid(0.42, 0.52, 0.38);

  const document = new Document();
  const buffer = document.createBuffer();
  const texture = document
    .createTexture("baseColor")
    .setImage(texBytes)
    .setMimeType("image/jpeg");

  const material = document
    .createMaterial("skin")
    .setBaseColorTexture(texture)
    .setRoughnessFactor(0.85)
    .setMetallicFactor(0);

  const posAcc = document
    .createAccessor("positions")
    .setType("VEC3")
    .setArray(positions)
    .setBuffer(buffer);
  const normAcc = document
    .createAccessor("normals")
    .setType("VEC3")
    .setArray(normals)
    .setBuffer(buffer);
  const uvAcc = document.createAccessor("uvs").setType("VEC2").setArray(uvs).setBuffer(buffer);
  const idxAcc = document
    .createAccessor("indices")
    .setType("SCALAR")
    .setArray(indices)
    .setBuffer(buffer);

  const prim = document
    .createPrimitive()
    .setMaterial(material)
    .setIndices(idxAcc)
    .setAttribute("POSITION", posAcc)
    .setAttribute("NORMAL", normAcc)
    .setAttribute("TEXCOORD_0", uvAcc);

  const mesh = document.createMesh("head").addPrimitive(prim);
  const neckPivot = document.createNode("neckPivot");
  const headNode = document.createNode("head").setMesh(mesh);
  neckPivot.addChild(headNode);

  const scene = document.createScene("scene").addChild(neckPivot);
  document.getRoot().setDefaultScene(scene);

  await document.transform(dedup(), flatten());

  fs.mkdirSync(path.dirname(out), { recursive: true });
  const io = new NodeIO().registerExtensions([KHRMeshQuantization]);
  await io.write(out, document);

  const jpgOut = out.replace(/\.glb$/i, ".jpg");
  await sharp(sourcePath)
    .resize(1024, 1024, { fit: "cover", position: "centre" })
    .jpeg({ quality: 88 })
    .toFile(jpgOut);

  const stat = fs.statSync(out);
  console.log(`Wrote ${out} (${(stat.size / 1024).toFixed(1)} KB)`);
  console.log(`Wrote ${jpgOut} (runtime texture for prototype viewer)`);
  console.log(
    "Note: ellipsoid placeholder — run MICA/DECA/TripoSR for real likeness before shipping tier D.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
