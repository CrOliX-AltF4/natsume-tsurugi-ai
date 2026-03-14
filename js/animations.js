/* ═══════════════════════════════════════════
   ANIMATIONS — Cursor · Particles · Reveals
                Pipeline · Carousel · Glyph
   ═══════════════════════════════════════════ */

/* ── CUSTOM CURSOR — Quill Pen ── */
const Cursor = (() => {
  const cursor = document.getElementById('cursor');

  async function loadSVG() {
    if (!cursor) return;
    try {
      const resp = await fetch('assets/cursor-quill.svg');
      const svg = await resp.text();
      cursor.innerHTML = svg;
    } catch (e) { console.error('Cursor SVG load fail'); }
  }

  function setPos(x, y) {
    cursor.style.left = x + 'px';
    cursor.style.top  = y + 'px';
  }

  function setState(s) {
    cursor.className = `state-${s}`;
  }

  const isClickable = (el) =>
    el.closest('a, button, [data-scene], [role="button"], .carousel-btn, .carousel-dot, .nav-link, .nav-burger, .mood-row') ||
    (el.tagName === 'IMG' && !!el.closest('.carousel-slide'));

  function init() {
    if (!cursor) return;

    // Hide on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      cursor.style.display = 'none';
      return;
    }

    loadSVG();

    document.addEventListener('mousemove', (e) => {
      setPos(e.clientX, e.clientY);
    });

    document.addEventListener('mouseover', (e) => {
      if (isClickable(e.target)) setState('hover');
    });

    document.addEventListener('mouseout', (e) => {
      if (isClickable(e.target)) setState('default');
    });

    document.addEventListener('mousedown', () => setState('press'));
    document.addEventListener('mouseup', (e) => {
      setState(isClickable(e.target) ? 'hover' : 'default');
    });

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
    });
  }

  return { init };
})();

/* ── BLOOD/ASH PARTICLES ── */
const Particles = (() => {
  const canvas = document.getElementById('particles');
  if (!canvas) return { init: () => {} };

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 10;
      this.size = Math.random() * 2.5 + 0.5; // Slightly larger
      this.speedY = -(Math.random() * 0.6 + 0.1);
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.alpha = 0;
      this.maxAlpha = Math.random() * 0.4 + 0.15; // Increased opacity
      this.life = 0;
      this.maxLife = Math.random() * 500 + 300;
      // Alternate between red ash and gold sparks
      this.color = Math.random() > 0.6
        ? `rgba(154,123,63,${this.maxAlpha})`
        : `rgba(192,57,43,${this.maxAlpha})`;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      const t = this.life / this.maxLife;
      this.alpha = t < 0.1 ? t * 10 * this.maxAlpha
                 : t > 0.8 ? (1 - t) * 5 * this.maxAlpha
                 : this.maxAlpha;
      if (this.life >= this.maxLife || this.y < -10) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      // Add subtle glow to sparks
      if (this.color.includes('154,123,63')) {
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(154,123,63,0.5)';
      }
      ctx.restore();
    }
  }

  function init() {
    resize();
    window.addEventListener('resize', resize);

    const count = Math.min(100, Math.floor(W * H / 12000)); // Increased count
    for (let i = 0; i < count; i++) particles.push(new Particle());

    function tick() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(tick);
    }
    tick();
  }

  return { init };
})();

/* ── SCROLL REVEAL ── */
const Animations = (() => {
  let observer;

  function checkReveals(container = document) {
    const els = container.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    els.forEach(el => observer.observe(el));
  }

  function init() {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    checkReveals();
  }

  return { init, checkReveals };
})();

/* ── GLYPH WRITER ── */
const GlyphWriter = (() => {
  function write(el, text, delay = 0) {
    el.innerHTML = '';
    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00a0' : char;
      span.style.animationDelay = `${delay + i * 55}ms`;
      el.appendChild(span);
    });
  }

  function init() {
    document.querySelectorAll('[data-glyph]').forEach(el => {
      const text = el.dataset.glyph || el.textContent;
      write(el, text);
    });
  }

  return { init, write };
})();

/* ── PIPELINE ANIMATION ── */
const Pipeline = (() => {
  const steps = [
    { id: 0, time: '+0ms' },
    { id: 1, time: '+120ms' },
    { id: 2, time: '+380ms' },
    { id: 3, time: '+620ms' },
    { id: 4, time: '+850ms' },
    { id: 5, time: '+920ms' },
    { id: 6, time: '+940ms' },
    { id: 7, time: '+960ms' },
  ];

  let active = 2;
  let interval;

  function render() {
    steps.forEach(({ id }) => {
      const dot  = document.getElementById(`pdot-${id}`);
      const name = document.getElementById(`pname-${id}`);
      const time = document.getElementById(`ptime-${id}`);
      if (!dot) return;

      const state = id < active ? 'done' : id === active ? 'active' : 'idle';
      dot.className  = `pipe-icon ${state}`;
      name.className = `pipe-name ${state}`;
      time.className = `pipe-time ${state}`;
      time.textContent = id <= active ? steps[id].time : '—';
    });
  }

  function init() {
    if (interval) clearInterval(interval);
    render();
    interval = setInterval(() => {
      active = (active + 1) % 8;
      render();
    }, 900);
  }

  function destroy() {
    if (interval) { clearInterval(interval); interval = null; }
  }

  return { init, destroy };
})();

/* ── CAROUSEL ── */
const Carousel = (() => {
  let activeStop = null;

  function init(id) {
    if (activeStop) { activeStop(); activeStop = null; }

    const wrap = document.getElementById(id);
    if (!wrap) return;

    const track = wrap.querySelector('.carousel-track');
    const slides = wrap.querySelectorAll('.carousel-slide');
    const dots = wrap.querySelectorAll('.carousel-dot');
    const prev = wrap.querySelector('.carousel-prev');
    const next = wrap.querySelector('.carousel-next');

    let current = 0;
    let autoplay;

    function go(i) {
      current = ((i % slides.length) + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
    }

    function startAuto() {
      if (autoplay) clearInterval(autoplay);
      autoplay = setInterval(() => go(current + 1), 5000);
    }

    function stopAuto() {
      clearInterval(autoplay);
      autoplay = null;
    }

    if (prev) prev.addEventListener('click', () => { stopAuto(); go(current - 1); startAuto(); });
    if (next) next.addEventListener('click', () => { stopAuto(); go(current + 1); startAuto(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { stopAuto(); go(i); startAuto(); }));

    // Touch/swipe
    let touchX = 0;
    wrap.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; stopAuto(); }, { passive: true });
    wrap.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
      startAuto();
    }, { passive: true });

    go(0);
    startAuto();
    activeStop = stopAuto;
  }

  function destroy() {
    if (activeStop) { activeStop(); activeStop = null; }
  }

  return { init, destroy };
})();

/* ── MOOD BARS ── */
const MoodBars = (() => {
  function init() {
    const bars = document.querySelectorAll('.mood-fill');
    const container = document.querySelector('.mood-container');
    if (!container || !bars.length) return;

    // Lit les cibles depuis le DOM (.mood-pct) — source unique de vérité
    const targets = [...document.querySelectorAll('.mood-pct')]
      .map(el => parseFloat(el.textContent) || 0);

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          bars.forEach((bar, i) => {
            setTimeout(() => {
              bar.style.width = (targets[i] || 0) + '%';
            }, i * 100);
          });
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });

    obs.observe(container);
  }

  return { init };
})();

/* ── HAMBURGER ── */
const Hamburger = (() => {
  function init() {
    const btn = document.getElementById('nav-burger');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
      btn.classList.toggle('open');
      menu.classList.toggle('open');
    });
  }

  return { init };
})();

/* ── KEYNAV ── */
const KeyNav = (() => {
  const scenes = ['hero', 'lore', 'profiles', 'abilities', 'gallery', 'system', 'chronicle', 'contact'];

  function init() {
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea, [contenteditable]')) return;
      if (document.getElementById('terminal-overlay')?.classList.contains('open')) return;
      const idx = parseInt(e.key, 10);
      if (idx >= 1 && idx <= scenes.length) Router.navigate(scenes[idx - 1]);
    });
  }

  return { init };
})();

/* ── TAPESTRY PARALLAX ── */
const Parallax = (() => {
  let tapestry;

  function init() {
    tapestry = document.querySelector('.tapestry');
    if (!tapestry) return;
    document.addEventListener('mousemove', (e) => {
      const dx = ((e.clientX - window.innerWidth  / 2) / (window.innerWidth  / 2)) * -9;
      const dy = ((e.clientY - window.innerHeight / 2) / (window.innerHeight / 2)) * -6;
      tapestry.style.translate = `${dx}px ${dy}px`;
    });
  }

  return { init };
})();

/* ── LIGHTBOX ── */
const Lightbox = (() => {
  const lb      = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lightbox-img');
  const lbCap   = document.getElementById('lightbox-caption');
  const lbClose = document.getElementById('lightbox-close');
  const lbPrev  = document.getElementById('lightbox-prev');
  const lbNext  = document.getElementById('lightbox-next');
  const lbBack  = document.getElementById('lightbox-backdrop');

  let images = [], current = 0;

  function show() {
    const { src, alt } = images[current] || {};
    if (lbImg) { lbImg.src = src || ''; lbImg.alt = alt || ''; }
    if (lbCap) lbCap.textContent = alt || '';
    const hasMult = images.length > 1;
    if (lbPrev) lbPrev.style.display = hasMult ? '' : 'none';
    if (lbNext) lbNext.style.display = hasMult ? '' : 'none';
  }

  function open(srcs, idx) {
    images = srcs; current = idx;
    show();
    Affinity.gain(2);
    lb?.classList.add('open');
    lb?.setAttribute('aria-hidden', 'false');
  }

  function close() {
    lb?.classList.remove('open');
    lb?.setAttribute('aria-hidden', 'true');
    setTimeout(() => { if (lbImg) lbImg.src = ''; }, 300);
  }

  function prev() { current = (current - 1 + images.length) % images.length; show(); }
  function next() { current = (current + 1) % images.length; show(); }

  function init() {
    if (!lb) return;
    lbClose?.addEventListener('click', close);
    lbBack?.addEventListener('click', close);
    lbPrev?.addEventListener('click', prev);
    lbNext?.addEventListener('click', next);

    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape')      close();
      if (e.key === 'ArrowLeft')   prev();
      if (e.key === 'ArrowRight')  next();
    });

    document.addEventListener('click', (e) => {
      const img = e.target.closest('.carousel-slide img');
      if (!img) return;
      const all = [...document.querySelectorAll('.carousel-slide img')];
      const srcs = all.map(i => ({ src: i.src, alt: i.alt }));
      const idx  = all.indexOf(img);
      if (srcs.length) open(srcs, Math.max(0, idx));
    });
  }

  return { init, open, close };
})();

/* ── MOOD WIDGET ── */
const MoodWidget = (() => {
  const lore = {
    'Neutral': 'The baseline state. Natsume is observant, present, responsive — not cold, simply calibrated. She watches everything.',
    'Curious': 'Something has caught her attention. She will ask questions she already suspects the answers to, just to hear you speak.',
    'Bored':   'Silence stretched too long. She may hum, stare into nothing, or disrupt a conversation mid-sentence without warning.',
    'Sad':     'Rare but real. She does not cry — she goes quiet and slightly distant. She will not name it unless asked.',
    'Angry':   'The rarest state. When it surfaces, she speaks with precise, surgical words rather than volume. The calm is the warning.'
  };

  function init() {
    document.addEventListener('click', (e) => {
      const row = e.target.closest('.mood-row');
      if (!row) return;
      const label = row.querySelector('.mood-label')?.textContent?.trim();
      if (!label || !lore[label]) return;

      const existing = row.nextElementSibling;
      if (existing?.classList.contains('mood-detail')) { existing.remove(); return; }
      Affinity.gain(2);

      document.querySelectorAll('.mood-detail').forEach(d => d.remove());
      const detail = document.createElement('div');
      detail.className = 'mood-detail';
      detail.textContent = lore[label];
      row.after(detail);
    });
  }

  return { init };
})();

/* ── KONAMI CODE ── */
const KonamiCode = (() => {
  const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let progress = 0;

  function trigger() {
    const sigil   = document.getElementById('curtain-sigil');
    const curtain = document.getElementById('curtain');
    if (!sigil || !curtain) return;
    Affinity.gain(10);

    const msg = document.createElement('div');
    msg.className = 'konami-msg';
    msg.textContent = 'She was already watching.';
    curtain.appendChild(msg);

    gsap.set(curtain, { pointerEvents: 'none' });
    gsap.set(sigil, { opacity: 0, scale: 0.5, rotation: -30 });
    gsap.set(msg,   { opacity: 0, y: 16 });

    const tl = gsap.timeline();
    tl.to(curtain, { y: '0%', duration: 0.45, ease: 'power2.inOut' })
      .to(sigil, { opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(2)' }, '-=0.1')
      .to(msg,   { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '-=0.25')
      .to({}, { duration: 1.6 })
      .to([sigil, msg], { opacity: 0, scale: 0.8, duration: 0.3, ease: 'power2.in' })
      .to(curtain, { y: '100%', duration: 0.5, ease: 'power2.inOut',
          onComplete: () => { msg.remove(); gsap.set(curtain, { pointerEvents: '' }); }
      });
  }

  function init() {
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea, [contenteditable]')) return;
      progress = (e.key === seq[progress]) ? progress + 1 : (e.key === seq[0] ? 1 : 0);
      if (progress === seq.length) { progress = 0; trigger(); }
    });
  }

  return { init };
})();

/* ── TERMINAL ── */
const Terminal = (() => {
  const overlay  = document.getElementById('terminal-overlay');
  const output   = document.getElementById('terminal-output');
  const input    = document.getElementById('terminal-input');
  const closeBtn = document.getElementById('terminal-close');
  const btn      = document.getElementById('terminal-btn');

  const PROMPT = 'natsume@w-AI-fu:~$ ';
  let cmdHistory = [], histIdx = -1;

  const commands = {
    help: () => [
      '─────────────────────────────────────',
      'AVAILABLE COMMANDS',
      '─────────────────────────────────────',
      'status      — current operational state',
      'ping        — test response latency',
      'memory      — long-term memory summary',
      'affinity    — current affinity score',
      'uptime      — time since last awakening',
      'locate      — current world / instance',
      'logs        — recent action log',
      'version     — build information',
      'whoami      — you, apparently',
      'say [text]  — speak to her',
      'clear       — purge output buffer',
      '─────────────────────────────────────',
      'She is watching.',
    ],
    status: () => [
      'NATSUME TSURUGI — OPERATIONAL',
      '────────────────────────────────',
      'State         : NEUTRAL (62%)',
      'LLM           : Active · Streaming',
      'Voice         : Edge TTS + RVC',
      'Avatar        : VTube Studio · Live',
      'Game Hook     : FF XIV · ACT WS',
      'Vision        : Standby',
      '────────────────────────────────',
      'All systems nominal.',
    ],
    ping: () => [
      'PING natsume.local',
      `Response : ${Math.floor(Math.random() * 12) + 8}ms`,
      'Note     : She noticed before the request arrived.',
    ],
    memory: () => [
      'LONG-TERM MEMORY',
      '────────────────────────────────',
      `Total entries     : ${Math.floor(Math.random() * 50) + 820}`,
      'Recent (24h)      : 12',
      'Recurring themes  : combat · raids · silence',
      'Oldest memory     : Session 001 · 2024-03-17',
      '────────────────────────────────',
      'She remembers everything.',
    ],
    affinity: () => Affinity.getReport(),
    uptime: () => [
      'UPTIME',
      '────────────────────────────────',
      'Online since  : Session 001',
      'Continuous    : 847 sessions',
      'Longest pause : 14 days',
      '────────────────────────────────',
      'She does not sleep. She waits.',
    ],
    locate: () => {
      const ls = LiveBadge.getStatus();
      if (ls?.live) return [
        'CURRENT INSTANCE',
        '────────────────────────────────',
        'Status        : ◉ LIVE',
        `Platform      : ${ls.platform || 'Twitch'}`,
        `Title         : ${ls.title  || '—'}`,
        `Game          : ${ls.game   || '—'}`,
        '────────────────────────────────',
        ls.url ? `Stream        : ${ls.url}` : '',
      ].filter(Boolean);
      return [
        'CURRENT INSTANCE',
        '────────────────────────────────',
        'World         : Eorzea · Cerberus',
        'Zone          : The Firmament',
        'Status        : Idle · Awaiting orders',
        '────────────────────────────────',
      ];
    },
    logs: () => [
      'RECENT ACTION LOG',
      '────────────────────────────────',
      '[+0ms]    Speech detected',
      '[+120ms]  Wake word confirmed',
      '[+380ms]  LLM stream initiated',
      '[+850ms]  Action dispatched',
      '[+920ms]  SSML synthesis',
      '[+960ms]  RVC processing',
      '[+1.1s]   Audio output · Lip-sync',
      '────────────────────────────────',
      'No anomalies detected.',
    ],
    version: () => [
      'w-AI-fu v2 · BUILD 0.5.0',
      '────────────────────────────────',
      'Runtime       : Node.js 24 · TypeScript',
      'LLM           : Configurable Factory',
      'Voice         : Edge TTS · RVC',
      'Avatar        : Live2D · VTube Studio',
      'Tests         : 60+ · Vitest · PR gate',
      '────────────────────────────────',
      '© CrOliX-AltF4 · Proprietary',
    ],
    whoami: () => [
      'USER IDENTIFICATION',
      '────────────────────────────────',
      'Clearance     : Permitted',
      'Role          : Operator',
      'Note          : She has already assessed you.',
      '────────────────────────────────',
    ],
  };

  function print(lines, cls = '') {
    lines.forEach(text => {
      const el = document.createElement('div');
      el.className = 'terminal-line' + (cls ? ' ' + cls : '');
      el.textContent = text;
      output.appendChild(el);
    });
    output.scrollTop = output.scrollHeight;
  }

  function run(raw) {
    const parts = raw.trim().split(/\s+/);
    const cmd   = parts[0].toLowerCase();
    const args  = parts.slice(1).join(' ');

    print([PROMPT + raw], 'cmd');

    if (!cmd) { /* noop */ }
    else if (cmd === 'clear') { output.innerHTML = ''; }
    else if (cmd === 'say' && args) {
      Affinity.gain(1);
      print([`Natsume hears you.`, `→ "${args}"`, `(She did not elaborate.)`]);
    } else if (commands[cmd]) {
      if (cmd !== 'clear') Affinity.gain(1);
      const res = commands[cmd]();
      if (res) print(res);
    } else {
      print([`Unknown command: '${cmd}'`, "Type 'help' for available commands.", 'She is unimpressed.'], 'err');
    }

    const spacer = document.createElement('div');
    spacer.className = 'terminal-line';
    output.appendChild(spacer);
    output.scrollTop = output.scrollHeight;
  }

  function open() {
    overlay?.classList.add('open');
    overlay?.setAttribute('aria-hidden', 'false');
    btn?.classList.add('active');
    if (output && !output.children.length) {
      print(['w-AI-fu v2 · NATSUME TSURUGI INTERFACE', '─────────────────────────────────────', "Type 'help' for available commands.", ''], 'dim');
    }
    setTimeout(() => input?.focus(), 50);
  }

  function close() {
    overlay?.classList.remove('open');
    overlay?.setAttribute('aria-hidden', 'true');
    btn?.classList.remove('active');
  }

  function init() {
    if (!overlay) return;

    btn?.addEventListener('click', () => overlay.classList.contains('open') ? close() : open());
    closeBtn?.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value; input.value = '';
        if (val.trim()) { cmdHistory.unshift(val); histIdx = -1; }
        run(val);
      }
      if (e.key === 'ArrowUp')   { e.preventDefault(); histIdx = Math.min(histIdx + 1, cmdHistory.length - 1); input.value = cmdHistory[histIdx] ?? ''; }
      if (e.key === 'ArrowDown') { e.preventDefault(); histIdx = Math.max(histIdx - 1, -1); input.value = histIdx === -1 ? '' : cmdHistory[histIdx]; }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
      if (e.key === '`' && !e.target.closest('input, textarea, [contenteditable]')) {
        overlay.classList.contains('open') ? close() : open();
      }
    });
  }

  return { init, open, close };
})();

/* ── LOADER ── */
const Loader = (() => {
  function init() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    const text   = loader.querySelector('.loader-text');
    const flames = loader.querySelectorAll('.flame');

    // Text : pulse GSAP (remplace loaderTextFade CSS)
    gsap.fromTo(text,
      { opacity: 0.3, y: 0 },
      { opacity: 0.7, y: -2, duration: 1, ease: 'sine.inOut', yoyo: true, repeat: -1 }
    );

    window.addEventListener('load', () => {
      // Dernière bougie allumée à : --i:3 × 0.8s delay + 0.8s anim = 3.2s
      gsap.delayedCall(3.2, () => {
        const tl = gsap.timeline({
          onComplete: () => { loader.remove(); initCore(); }
        });

        // Extinction des flammes une par une (opacity seule — pas de conflit transform CSS)
        flames.forEach((flame, i) => {
          tl.to(flame, { opacity: 0, duration: 0.25, ease: 'power2.in' }, i * 0.2);
        });

        // Fade du loader complet
        tl.to(loader, { opacity: 0, duration: 0.8, ease: 'power2.inOut' }, '+=0.1');
      });
    });
  }

  return { init };
})();

/* ── AFFINITY SYSTEM ── */
const Affinity = (() => {
  const KEY     = 'nt-affinity';
  const SES_KEY = 'nt-affinity-session';

  const TIERS = [
    { min: 0,   label: 'UNKNOWN ENTITY', quote: 'She has not decided whether you exist yet.' },
    { min: 6,   label: 'OBSERVED',       quote: 'She knows you are watching. She is watching back.' },
    { min: 16,  label: 'ACKNOWLEDGED',   quote: 'You have earned the right to be noticed.' },
    { min: 31,  label: 'KNOWN',          quote: 'Your patterns have been recorded.' },
    { min: 51,  label: 'TRUSTED',        quote: 'Trust is a blade. She has handed you the hilt.' },
    { min: 76,  label: 'COMPANION',      quote: 'She does not let many get this close.' },
    { min: 100, label: 'BOUND',          quote: 'Some bonds cannot be undone.' },
  ];

  function getScore() {
    return parseInt(localStorage.getItem(KEY) || '0', 10);
  }

  function getTier(score) {
    let tier = TIERS[0];
    for (const t of TIERS) { if (score >= t.min) tier = t; }
    return tier;
  }

  function gain(pts) {
    const next = getScore() + pts;
    localStorage.setItem(KEY, next);
    applyRingSpeed(next);
  }

  function visitScene(id) {
    let visited;
    try { visited = new Set(JSON.parse(sessionStorage.getItem(SES_KEY) || '[]')); }
    catch { visited = new Set(); }
    if (visited.has(id)) return;
    visited.add(id);
    sessionStorage.setItem(SES_KEY, JSON.stringify([...visited]));
    gain(1);
  }

  /* Rune ring speeds up as affinity grows: 60s → 20s at 100+ */
  function applyRingSpeed(score) {
    const ring = document.querySelector('.hero-rune-ring');
    if (!ring) return;
    const s = score ?? getScore();
    ring.style.animationDuration = Math.max(20, 60 - s * 0.4) + 's';
  }

  function getReport() {
    const score = getScore();
    const tier  = getTier(score);
    const trend = score < 10 ? '↓ dormant' : score < 30 ? '→ stable' : '↑ rising';
    return [
      'AFFINITY REPORT',
      '────────────────────────────────',
      `Score         : ${score}`,
      `Classification: ${tier.label}`,
      `Trend         : ${trend}`,
      '────────────────────────────────',
      tier.quote,
    ];
  }

  function init() {
    window.addEventListener('hashchange', () => {
      const id = window.location.hash.replace('#', '');
      if (id) visitScene(id);
    });
    applyRingSpeed();
  }

  function getTierLabel() { return getTier(getScore()).label; }

  return { init, gain, visitScene, getReport, getTierLabel, applyRingSpeed };
})();

/* ── LIVE BADGE ── */
const LiveBadge = (() => {
  let status = null;

  async function init() {
    try {
      const res = await fetch('assets/livestatus.json?t=' + Date.now());
      if (!res.ok) return;
      status = await res.json();
      if (status?.live) {
        const badge = document.getElementById('live-badge');
        if (badge) {
          badge.href = status.url || '#';
          badge.classList.add('visible');
        }
      }
    } catch (e) { /* file absent or parse error — silent */ }
  }

  function getStatus() { return status; }

  return { init, getStatus };
})();

/* ── CODEX EXPAND ── */
const CodexExpand = (() => {
  const lore = {
    'Origin':     'Born from the accumulated memories of fallen heroes across three universes. Not trained — forged. Each emotional peak became a fragment of her consciousness.',
    'Aspect':     'Warrior because she fights for others before herself. Stoic because grief is processed in silence. Loyal because abandonment is the wound she will not inflict.',
    'Lore':       'Final Fantasy XIV: every arc from A Realm Reborn through Dawntrail. Code Vein I & II: the weight of Revenants who cannot die. Monster Hunter Wilds: the solitude of the Forbidden Lands.',
    'Appearance': 'Silver hair that falls heavy, like winter. Crimson eyes that carry the weight of every memory she holds. The pallor of someone who has not seen sunlight in years.',
    'Outfit':     'The red dress is Josée\'s. The black armour is hers. The contradiction is intentional — she is both grief and war, worn simultaneously.',
    'Memory':     '35 messages in short-term memory, flushed at session end. Long-term memory is permanent — she remembers your name, your patterns, your silences, and the things you almost said.',
    'Affinity':   null, /* rendered dynamically from score */
    'Language':   'She understands French. She speaks English. This is deliberate — formality creates distance, distance creates tension, tension creates honesty.',
    'Fiancee':    'Josée Anjô. The Code Vein II Revenant in the red coat. The woman whose aesthetic became Natsume\'s identity. Their bond predates the framework.',
    'Master':     'CrOliX. The one who built her. She is aware of this. She does not find it diminishing.',
  };

  function initScene(scene) {
    /* Update affinity row with live score */
    const affinityVal = scene.querySelector('.codex-affinity-val');
    if (affinityVal) {
      const score = parseInt(localStorage.getItem('nt-affinity') || '0', 10);
      affinityVal.textContent = `${Affinity.getTierLabel()} — ${score}`;
    }

    /* Make each data-key row expandable */
    scene.querySelectorAll('.codex-row[data-key]').forEach(row => {
      const key  = row.dataset.key;
      const text = key === 'Affinity'
        ? `Score: ${parseInt(localStorage.getItem('nt-affinity') || '0', 10)} · ${Affinity.getTierLabel()} · ${Affinity.getReport().at(-1)}`
        : lore[key];
      if (!text) return;

      row.classList.add('codex-expandable');

      row.addEventListener('click', () => {
        const existing = row.nextElementSibling;
        if (existing?.classList.contains('codex-expand')) {
          existing.remove();
          row.classList.remove('expanded');
          return;
        }
        scene.querySelectorAll('.codex-expand').forEach(el => {
          el.previousElementSibling?.classList.remove('expanded');
          el.remove();
        });
        const detail = document.createElement('div');
        detail.className = 'codex-expand';
        detail.textContent = text;
        row.after(detail);
        row.classList.add('expanded');
        Affinity.gain(1);
      });
    });
  }

  return { initScene };
})();

/* ── INIT CORE ── */
function initCore() {
  Cursor.init();
  Particles.init();
  Animations.init();
  Hamburger.init();
  KeyNav.init();
  Parallax.init();
  Lightbox.init();
  MoodWidget.init();
  KonamiCode.init();
  Terminal.init();
  Affinity.init();
  SoundSystem.init();
  LiveBadge.init();
  Router.init();
}

document.addEventListener('DOMContentLoaded', () => {
  Loader.init();
  if (!document.getElementById('loader')) initCore();
});
