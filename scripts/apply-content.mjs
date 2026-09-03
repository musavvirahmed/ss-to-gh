#!/usr/bin/env node
/**
 * Bake content/site.yaml into marked slots in public/index.html and public/404.html.
 * Cloudflare Pages build command (ADR-0007).
 */
import { applyContent } from "./lib/site-content.mjs";

applyContent();
console.log("Applied content/*.yaml → public/");
