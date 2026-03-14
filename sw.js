/* ═══════════════════════════════════════════
   SERVICE WORKER — Natsume Tsurugi v0.5.0
   Strategy:
   · Static assets  → Cache First
   · livestatus.json → Network First (changes live)
   · Sections HTML  → Stale While Revalidate
   ═══════════════════════════════════════════ */

const CACHE     = 'nt-cache-v0.5.0';
const EPHEMERAL = ['assets/livestatus.json'];

const PRECACHE = [
  '/',
  '/index.html',
  '/404.html',
  '/manifest.json',
  '/css/base.css',
  '/css/components.css',
  '/css/animations.css',
  '/js/router.js',
  '/js/animations.js',
  '/js/audio.js',
  '/sections/hero.html',
  '/sections/lore.html',
  '/sections/profiles.html',
  '/sections/abilities.html',
  '/sections/gallery.html',
  '/sections/system.html',
  '/sections/chronicle.html',
  '/sections/contact.html',
  '/assets/natsume-CV2.png',
  '/assets/crest.png',
  '/assets/loader-sigil.svg',
  '/assets/cursor-quill.svg',
  'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js',
];

/* ── Install: pre-cache static shell ── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: purge old caches ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch ── */
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  /* Network-first for livestatus (dynamic data) */
  if (EPHEMERAL.some(p => url.pathname.endsWith(p))) {
    e.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  /* Stale-while-revalidate for section HTML */
  if (url.pathname.startsWith('/sections/')) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(request).then(cached => {
          const fresh = fetch(request).then(res => {
            cache.put(request, res.clone());
            return res;
          });
          return cached || fresh;
        })
      )
    );
    return;
  }

  /* Cache-first for everything else */
  e.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
