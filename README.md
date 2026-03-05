# Natsume Tsurugi — Site

Showcase site for the w-AI-fu v2 cognitive AI VTuber framework.

## Structure

```
natsume-tsurugi-site/
├── index.html          ← Main SPA
├── 404.html            ← Custom error page
├── favicon.svg         ← Site icon
├── vercel.json         ← Deploy config
├── css/
│   ├── base.css        ← Variables, reset, typography, cursor
│   ├── components.css  ← All UI components
│   └── animations.css  ← Keyframes, reveals, loader
├── js/
│   ├── router.js       ← SPA section switching + curtain transitions
│   └── animations.js   ← Cursor, particles, reveals, carousel, pipeline
└── assets/
    ├── natsume.png     ← [TODO] Commission illustration
    └── og-image.png    ← [TODO] 1200×630 social preview
```

## Dev — Local

```bash
# Install
npm install

# Run with live-reload
npm run dev
# → opens http://localhost:3000
```

Or without npm:
```bash
npx live-server --port=3000
```

## Adding Images to Carousel

Replace placeholders in `index.html` carousel slides:

```html
<div class="carousel-slide">
  <img src="assets/screenshot-ff14.jpg" alt="Natsume in Eorzea">
  <div class="carousel-caption">
    <div class="carousel-caption-label">Final Fantasy XIV</div>
    <div class="carousel-caption-title">In the world she calls home</div>
  </div>
</div>
```

## Adding the Demo Video

Replace the video placeholder in `scene-gallery`:

```html
<!-- YouTube embed -->
<div class="video-frame">
  <iframe width="100%" height="100%" 
    src="https://www.youtube.com/embed/YOUR_ID?autoplay=0"
    frameborder="0" allowfullscreen>
  </iframe>
</div>
```

## Deploy

Push to GitHub → Vercel auto-deploys on push to `main`.

```bash
git add .
git commit -m "feat: update site"
git push
```

## Updating Version

Search and replace `v0.4.0` in `index.html`.

## License

© 2025 CrOliX-AltF4 — All rights reserved.
