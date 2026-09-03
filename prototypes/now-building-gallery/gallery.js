/**
 * PROTOTYPE — /ai gallery variants A / B / C / D.
 * Question: does a title + paragraph + CTA gallery look right on musavvir.info?
 * D = same-site family pass (Aktiv-led, large type, first exhibit + spacious rows).
 */

const CARDS = [
  {
    id: "squarespace-cost",
    stub: false,
    title:
      "The recurring annual Squarespace cost I erased with the help of AI",
    paragraph:
      "Squarespace’s ~€132/year liability is gone. This site now runs on a free GitHub + Cloudflare stack. One month of Cursor Individual (~€20) helped build the pixel-identical clone—then we kept it free.",
    cta_href: "",
    cta_label: "View README on GitHub",
  },
  {
    id: "stub-sunglasses",
    stub: true,
    title: "Pixel sunglasses on the portrait (stub)",
    paragraph:
      "Placeholder density so a one-card ship isn’t the only layout you judge. CTA is a dummy href.",
    cta_href: "#stub-sunglasses",
    cta_label: "View README on GitHub",
  },
  {
    id: "stub-clone",
    stub: true,
    title: "A throwaway HTML clone of this site (stub)",
    paragraph:
      "Second stub card. Real past prototypes are optional later; they are not required to close the map.",
    cta_href: "#stub-clone",
    cta_label: "View README on GitHub",
  },
];

const VARIANTS = {
  A: {
    name: "Two-up cards",
    blurb:
      "Fyi-like 2-column bordered cards. Homepage-sized avatar stacked above title. Body grey #767676 (AA). First card has no CTA.",
  },
  B: {
    name: "Editorial stack",
    blurb:
      "No card boxes. Narrow reading column, Aktiv titles, hairline rules.",
  },
  C: {
    name: "Featured + rail",
    blurb:
      "Locked first card is the exhibit. Stubs sit in a compact side list.",
  },
  D: {
    name: "Same-site family",
    blurb:
      "Homepage scale: Aktiv throughout, first exhibit dominates, later entries as spacious rows — no cards, almost no rules.",
  },
};

const ORDER = ["A", "B", "C", "D"];

function currentKey() {
  const v = new URLSearchParams(location.search).get("variant");
  return ORDER.includes(v) ? v : "A";
}

function setVariant(key) {
  const url = new URL(location.href);
  url.searchParams.set("variant", key);
  history.replaceState({}, "", url);
  mount(key);
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function ctaHtml(card, className) {
  if (!card.cta_href) return "";
  return `<a class="${className}" href="${escapeHtml(card.cta_href)}"><span>${escapeHtml(card.cta_label)}</span></a>`;
}

function VariantA(cards) {
  const items = cards
    .map(
      (c) => `
      <article class="card-a">
        <h2 class="card-title">${escapeHtml(c.title)}</h2>
        <p class="card-p">${escapeHtml(c.paragraph)}</p>
        ${ctaHtml(c, "cta")}
      </article>`,
    )
    .join("");
  return `
    <div class="intro-a">
      <div class="portrait-slot" aria-hidden="true">
        <img
          src="/site/assets/pro-pic-circular-musa.png"
          width="216"
          height="216"
          alt=""
        />
      </div>
      <h1 class="page-title page-title-a">
        <span class="title-lead">What am I</span>
        <span class="title-main">Building with AI?</span>
      </h1>
    </div>
    <div class="grid-a">${items}</div>`;
}

function VariantB(cards) {
  const items = cards
    .map(
      (c) => `
      <article>
        <h2 class="stack-title">${escapeHtml(c.title)}</h2>
        <p class="stack-p">${escapeHtml(c.paragraph)}</p>
        ${ctaHtml(c, "cta")}
      </article>`,
    )
    .join("");
  return `
    <h1 class="page-title">Building with AI</h1>
    <div class="stack-b">${items}</div>`;
}

function VariantC(cards) {
  const [feature, ...rest] = cards;
  const rail = rest
    .map(
      (c) => `
      <article>
        <h3 class="rail-title">${escapeHtml(c.title)}</h3>
        <p class="rail-p">${escapeHtml(c.paragraph)}</p>
        ${ctaHtml(c, "cta")}
      </article>`,
    )
    .join("");
  return `
    <p class="page-kicker">Building with AI</p>
    <div class="layout-c">
      <article class="feature-c">
        <h1 class="feature-title">${escapeHtml(feature.title)}</h1>
        <p class="feature-p">${escapeHtml(feature.paragraph)}</p>
        ${ctaHtml(feature, "cta")}
      </article>
      <aside class="rail-c">
        <p class="rail-label">Also on display</p>
        ${rail}
      </aside>
    </div>`;
}

function VariantD(cards) {
  const [feature, ...rest] = cards;
  const rows = rest
    .map(
      (c) => `
      <article class="row-d">
        <h2 class="row-title">${escapeHtml(c.title)}</h2>
        <p class="row-p">${escapeHtml(c.paragraph)}</p>
        ${ctaHtml(c, "cta cta-d")}
      </article>`,
    )
    .join("");
  return `
    <div class="layout-d">
      <h1 class="page-title-d">Building with AI</h1>
      <article class="exhibit-d">
        <h2 class="exhibit-title">${escapeHtml(feature.title)}</h2>
        <p class="exhibit-p">${escapeHtml(feature.paragraph)}</p>
        ${ctaHtml(feature, "cta cta-d")}
      </article>
      <div class="rows-d">${rows}</div>
    </div>`;
}

function mount(key) {
  const root = document.getElementById("gallery-root");
  const v = VARIANTS[key];
  document.body.dataset.variant = key;
  if (key === "A") root.innerHTML = VariantA(CARDS);
  else if (key === "B") root.innerHTML = VariantB(CARDS);
  else if (key === "C") root.innerHTML = VariantC(CARDS);
  else root.innerHTML = VariantD(CARDS);

  const status = document.getElementById("runtime-status");
  if (status) {
    status.textContent = JSON.stringify(
      {
        variant: key,
        name: v.name,
        page: "/ai",
        cards: CARDS.map((c) => ({
          id: c.id,
          stub: c.stub,
          hasCta: Boolean(c.cta_href),
        })),
      },
      null,
      2,
    );
  }

  const label = document.getElementById("variant-label");
  if (label) label.innerHTML = `${key} (<span>${v.name}</span>)`;

  const blurb = document.getElementById("variant-blurb");
  if (blurb) blurb.textContent = v.blurb;

  document.title = `PROTOTYPE ${key} — Building with AI`;
}

function wireSwitcher() {
  const bar = document.querySelector(".proto-switcher");
  if (!bar) return;

  const prev = document.createElement("button");
  prev.type = "button";
  prev.setAttribute("aria-label", "Previous variant");
  prev.textContent = "←";
  prev.addEventListener("click", () => {
    const i = ORDER.indexOf(currentKey());
    setVariant(ORDER[(i - 1 + ORDER.length) % ORDER.length]);
  });

  const next = document.createElement("button");
  next.type = "button";
  next.setAttribute("aria-label", "Next variant");
  next.textContent = "→";
  next.addEventListener("click", () => {
    const i = ORDER.indexOf(currentKey());
    setVariant(ORDER[(i + 1) % ORDER.length]);
  });

  const label = document.getElementById("variant-label");
  bar.insertBefore(prev, label);
  bar.appendChild(next);

  window.addEventListener("keydown", (e) => {
    const t = e.target;
    if (
      t instanceof HTMLElement &&
      (t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.isContentEditable)
    ) {
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev.click();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next.click();
    }
  });
}

const key = currentKey();
mount(key);
wireSwitcher();
