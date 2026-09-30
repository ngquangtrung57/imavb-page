# Design notes — IMAVB project page

Static, hand-built page. No framework, no build step. `index.html` + `static/{css,js,images,videos,pdf}`.

## Concept
Two rooms. The **screening room** (ink `#0B0D12`) holds the hero, TL;DR, video, clip explorer, the Representation–Action Gap and the citation. The **reading room** (paper `#EDE8DF`) holds the abstract, figures, benchmark, results, PGLA and interference. Figures are white, so they sit as "prints" on paper.
Hero: letterbox bars, a muted loop of 8 IMAVB excerpts (2.39:1 crop), vignette, fixed film grain (SVG turbulence overlay), a slowly blinking eye.

## Colour tokens
Brand: vision `#5B9BF0`, audio `#F2994A`, false `#E5484D`, correct `#3FB27F`, probe `#A78BFA`. On paper the page swaps to darker variants (`--c-*` tokens in `.sec--paper`) to keep AA text contrast. Charts read the tokens at draw time.
Type: Instrument Serif (display), Inter Tight (UI), JetBrains Mono (labels, numbers). KaTeX 0.16.11 from jsDelivr for the PGLA equation.

## Data
All numbers live in `static/js/main.js` (arrays `BASE`, `GAP`, `TEXTREF`, `PGLA`, `INTERF`) and are copied from `BRIEF.md` / `main.tex`. The cross-modal A→V value for Qwen3-Omni (+2.0) comes from Table `tab:ablation` in `main.tex`.
Explorer questions are the verbatim dataset rows for `-5be_UPkLRw`, `--aqjaJyZLk`, `-7cV5cWQmxg` (the paper's main and appendix examples). `[[standard|misleading]]` marks the swapped detail. Audio cues come from the paper figures. No per-item model answers are shown, because the paper does not state them.

## Media
- `static/videos/hero_loop.mp4` — 8 × 3 s, 960×402, H.264, no audio (~1.2 MB).
- `static/videos/ex_*.mp4` — 12 s excerpts with audio, 854×480, starting at the answer window.
- `static/videos/imavb_promo.mp4` — NOT included. The `<video>` in `#video` points to it; drop the file in.
- `static/images/promo_poster.jpg` — placeholder title card (1280×720). Replace with a frame of the real promo if wanted.
- `static/images/og_card.jpg` — 1200×630 social card.

## Behaviour
Scroll reveals via IntersectionObserver. `prefers-reduced-motion` turns off grain, blink, reveals, count-ups and the hero autoplay. Charts are SVG, redrawn on resize, with hover/tap tooltips. Layout checked at 390 px and 1440 px (no horizontal scroll).
