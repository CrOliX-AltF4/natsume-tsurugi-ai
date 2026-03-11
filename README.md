# Natsume Tsurugi — Showcase Site

> *Not a tool. Not an assistant. A warrior entity born from the memories of fallen heroes.*

[![Live](https://img.shields.io/badge/live-natsume--tsurugi--ai.vercel.app-crimson?style=flat-square&logo=vercel)](https://natsume-tsurugi-ai.vercel.app)
[![Version](https://img.shields.io/badge/version-v0.5.0-gold?style=flat-square)](https://github.com/CrOliX-AltF4/natsume-tsurugi-ai/releases)
[![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![GSAP](https://img.shields.io/badge/GSAP-3.12.5-88CE02?style=flat-square&logo=greensock&logoColor=white)](https://gsap.com)
[![Vercel](https://img.shields.io/badge/deploy-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/license-UNLICENSED-lightgrey?style=flat-square)](./package.json)

Showcase site for the **w-AI-fu v2** cognitive AI VTuber framework. A single-page, no-framework, no-build vanilla experience with cinematic curtain transitions, parallax, and a custom SPA router.

---

## Sections

| Scene | Route | Description |
|---|---|---|
| Hero | `#hero` | Opening — avatar, aether rings, rune ring |
| Lore | `#lore` | Character origin and narrative |
| Profiles | `#profiles` | Active game deployments (FF XIV · MH Wilds · Osu! · Minecraft) |
| Abilities | `#abilities` | Core capabilities overview |
| Gallery | `#gallery` | Screenshot carousel + demo video |
| System | `#system` | Voice pipeline · emotional state · tech stack |
| Chronicle | `#chronicle` | Versioned roadmap — past chapters & prophecy |
| Contact | `#contact` | Links and reach |

---

## Features

- **SPA Router** — curtain transition with animated sigil between every scene
- **Keyboard navigation** — `1–8` to jump scenes, `←` `→` for prev/next
- **Mouse parallax** — tapestry layer responds to cursor position (CSS `translate`, independent of `transform`)
- **Hero rune ring** — SVG dashed rings + cardinal markers, slow continuous rotation
- **Gallery lightbox** — click any carousel image for fullscreen view, keyboard `←` `→` `Esc`
- **Mood widget** — click any emotion row in System to reveal lore text
- **Terminal overlay** — `>_` button (or `` ` ``), CRT scanlines, scripted commands (`help`, `status`, `memory`, `affinity`, `logs`, …)
- **Konami code** easter egg — ↑↑↓↓←→←→BA

---

## Structure

```
natsume-tsurugi-site/
├── index.html              ← Root — nav, terminal overlay, lightbox, loader
├── 404.html
├── vercel.json             ← SPA redirect rules
├── css/
│   ├── base.css            ← Variables, reset, typography, custom cursor
│   ├── components.css      ← All UI components (cards, terminal, lightbox, …)
│   └── animations.css      ← Keyframes, reveal classes, loader, rune ring
├── js/
│   ├── router.js           ← Scene loading, curtain transitions, hash routing
│   └── animations.js       ← Cursor, particles, parallax, carousel, all modules
└── sections/
    ├── hero.html
    ├── lore.html
    ├── profiles.html
    ├── abilities.html
    ├── gallery.html
    ├── system.html
    ├── chronicle.html
    └── contact.html
```

---

## Local Development

```bash
# Install dev dependency (live-server)
npm install

# Start with live-reload at http://localhost:3000
npm run dev
```

Or without installing:
```bash
npx live-server --port=3000 --open=index.html
```

---

## Deployment

Push to `main` → Vercel deploys automatically.

```bash
git add .
git commit -m "feat: description"
git push
```

`vercel.json` contains SPA rewrite rules so direct hash routes work correctly.

---

## Adding Gallery Content

**Carousel image:**
```html
<div class="carousel-slide">
  <img src="assets/screenshot-ff14.jpg" alt="Natsume in Eorzea">
  <div class="carousel-caption">
    <div class="carousel-caption-label">Final Fantasy XIV</div>
    <div class="carousel-caption-title">In the world she calls home</div>
  </div>
</div>
```

**Demo video (YouTube):**
```html
<div class="video-frame">
  <iframe width="100%" height="100%"
    src="https://www.youtube.com/embed/YOUR_ID?autoplay=0"
    frameborder="0" allowfullscreen>
  </iframe>
</div>
```

---

## Terminal Commands

Open with `` ` `` or click `>_` (bottom-right corner).

| Command | Description |
|---|---|
| `help` | List all commands |
| `status` | System + pipeline state |
| `ping` | Latency test |
| `memory` | LTM statistics |
| `affinity` | Current affinity score |
| `uptime` | Session duration |
| `locate` | Active game / zone |
| `logs` | Recent event log |
| `version` | Framework version |
| `whoami` | Identity record |
| `say <text>` | Transmit a message |
| `clear` | Clear terminal output |

---

## w-AI-fu v2 — Framework Status

| Chapter | Version | Status |
|---|---|---|
| I — The Foundation | v0.1 → v0.4.x | Complete |
| II — Depth & Dominion | v0.5.0 | Complete |
| III — Awareness & Soul | v0.6.0 | In Progress |
| IV — Stage & Stream | v0.7.0 | Planned |
| V — Transcendence | v1.0.0 | Vision |

---

## License

Site code: MIT
Character, lore, and assets: © 2026 CrOliX-AltF4 — All rights reserved
