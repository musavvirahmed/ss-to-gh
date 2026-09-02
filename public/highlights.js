/**
 * PROTOTYPE highlight painter — scales live TextShape path templates
 * (underlineCurve / scribble) captured from musavvir.info.
 */
(function () {
  // Captured at ~50px font / desktop. Coordinates normalized to unit box.
  // underlineCurve (growth hacking): view 357×64
  const UNDERLINE_CURVE = {
    vw: 357,
    vh: 64,
    d: "M 0,63.36 c 44.625,-1.76 89.25,-5.44 178.5,-7.04 c 89.25,-1.6 135.66,0 178.5,0.64 c 8.568,0.128 -6.783,1.824 -7.14,1.92",
  };
  // scribble (designOps): view 273×64 — multi-pass thin strokes
  const SCRIBBLE = {
    vw: 273,
    vh: 64,
    d: "M 0,56.32 c 20.475,-0.288 95.55,-2.112 136.5,-1.92 c 40.95,0.192 132.405,3.2 136.5,3.2 c 4.095,0 -72.345,-3.68 -109.2,-3.2 c -36.855,0.48 -132.405,5.632 -136.5,6.4 c -4.095,0.768 80.535,-1.28 109.2,-1.28 c 28.665,0 81.9,0.608 81.9,1.28 c 0,0.672 -61.425,2.72 -81.9,3.2 c -20.475,0.48 -46.41,0 -54.6,0",
  };

  function hslaToCss(hsla) {
    if (!hsla) return "#e63148";
    const { hue: H, saturation: S, lightness: L, alpha: A = 1 } = hsla;
    return `hsla(${H}, ${S * 100}%, ${L * 100}%, ${A})`;
  }

  function colorOf(attr) {
    const c = attr.color;
    if (!c) return "#e63148";
    if (c.type === "CUSTOM_COLOR") return hslaToCss(c.customColor?.hslaValue);
    if (c.type === "SITE_PALETTE_COLOR") {
      const name = c.sitePaletteColor?.colorName;
      if (name === "white") return "hsla(var(--white-hsl), 1)";
      if (name === "darkAccent") return "hsla(var(--darkAccent-hsl), 1)";
    }
    return "#e63148";
  }

  // say hello underlineCurve: view 206×64
  const UNDERLINE_HELLO = {
    vw: 206,
    vh: 64,
    d: "M 0,63.36 c 25.75,-1.76 51.5,-5.44 103,-7.04 c 51.5,-1.6 78.28,0 103,0.64 c 4.944,0.128 -3.914,1.824 -4.12,1.92",
  };

  function templateFor(shape, id) {
    if (shape === "scribble") return SCRIBBLE;
    // Linked underlines (say hello grey + Nord Security white) share the hello curve.
    if (
      id === "5b2cbb39-e010-44fa-8b48-321bcb15de97" ||
      id === "c8e4a1f2-3b5d-4e6a-9c0d-1f2a3b4c5d6e"
    ) {
      return UNDERLINE_HELLO;
    }
    return UNDERLINE_CURVE;
  }

  /** One box per wrapped line — live TextShape uses getClientRects, not union rect. */
  function lineFragments(el) {
    const rects = [...el.getClientRects()];
    if (!rects.length) {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) {
        return [{ left: r.left, top: r.top, width: r.width, height: r.height }];
      }
      return [];
    }

    const lines = new Map();
    for (const r of rects) {
      if (r.width < 1 || r.height < 1) continue;
      const key = Math.round(r.top);
      const line = lines.get(key);
      if (!line) {
        lines.set(key, {
          left: r.left,
          top: r.top,
          right: r.right,
          bottom: r.bottom,
          height: r.height,
        });
      } else {
        line.left = Math.min(line.left, r.left);
        line.top = Math.min(line.top, r.top);
        line.right = Math.max(line.right, r.right);
        line.bottom = Math.max(line.bottom, r.bottom);
        line.height = Math.max(line.height, r.height);
      }
    }

    return [...lines.values()]
      .sort((a, b) => a.top - b.top)
      .map((line) => ({
        left: line.left,
        top: line.top,
        width: line.right - line.left,
        height: line.height,
      }))
      .filter((line) => line.width >= 8);
  }

  function appendTextShape(host, hostRect, el, attr, id, rect, index) {
    const fontSize = parseFloat(getComputedStyle(el).fontSize) || 50;
    const h = fontSize * 1.28;
    const padX = fontSize * 0.08;
    const w = Math.max(rect.width + padX * 2, 8);
    const left = rect.left - hostRect.left - padX;
    const top =
      attr.shape === "scribble"
        ? rect.top - hostRect.top - (h - rect.height) * 0.35
        : rect.top - hostRect.top - (h - rect.height) * 0.15;

    const tmpl = templateFor(attr.shape, id);
    const stroke = colorOf(attr);
    const thickness = attr.thickness?.value ?? 0.05;
    const linecap = attr.linecap || "round";
    const linejoin = attr.shape === "scribble" ? "bevel" : "round";

    const node = document.createElement("div");
    node.className = "TextShape-node";
    node.dataset.textAttributeId = id;
    node.dataset.shape = attr.shape;
    node.dataset.isFront = String(!!attr.isFront);
    node.dataset.index = String(index);
    node.style.cssText = [
      `font-size:${fontSize}px`,
      `--stroke:${stroke}`,
      `--stroke-width:${thickness}em`,
      `--stroke-linecap:${linecap}`,
      `--stroke-linejoin:${linejoin}`,
      `width:${w}px`,
      `height:${h}px`,
      `left:${left}px`,
      `top:${top}px`,
    ].join(";");

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${tmpl.vw} ${tmpl.vh}`);
    svg.setAttribute("preserveAspectRatio", "none");
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", tmpl.d);
    path.setAttribute("stroke-dasharray", "none");
    path.setAttribute("stroke-dashoffset", "0");
    svg.appendChild(path);
    node.appendChild(svg);
    host.appendChild(node);
  }

  function paint() {
    document.querySelectorAll(".TextShape-node").forEach((n) => n.remove());

    const propsEl = document.querySelector("script.TextAttributes-props");
    if (!propsEl) return;
    let attrs;
    try {
      attrs = JSON.parse(propsEl.textContent);
    } catch {
      return;
    }
    const byId = Object.fromEntries(attrs.map((a) => [a.id, a]));
    const host = document.querySelector(
      "#block-880e0a4d670baafb02b2 .sqs-block-content",
    );
    if (!host) return;
    const hostRect = host.getBoundingClientRect();

    document
      .querySelectorAll(".sqsrte-text-highlight[data-text-attribute-id]")
      .forEach((el) => {
        const id = el.getAttribute("data-text-attribute-id");
        const attr = byId[id];
        if (!attr) return;

        lineFragments(el).forEach((rect, index) => {
          appendTextShape(host, hostRect, el, attr, id, rect, index);
        });
      });
  }

  const run = () => {
    paint();
    requestAnimationFrame(paint);
  };

  if (document.fonts?.ready) document.fonts.ready.then(run);
  else window.addEventListener("load", run);

  window.addEventListener("resize", () => {
    clearTimeout(window.__protoHlT);
    window.__protoHlT = setTimeout(paint, 80);
  });
})();
