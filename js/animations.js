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
    el.closest('a, button, [data-scene], [role="button"], .carousel-btn, .carousel-dot, .nav-link, .nav-burger');

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
      active = (active + 1) % 7;
      render();
    }, 900);
  }

  return { init };
})();

/* ── CAROUSEL ── */
const Carousel = (() => {
  function init(id) {
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
  }

  return { init };
})();

/* ── MOOD BARS ── */
const MoodBars = (() => {
  const targets = [62, 22, 9, 5, 2];

  function init() {
    const bars = document.querySelectorAll('.mood-fill');
    const container = document.querySelector('.mood-container');
    if (!container || !bars.length) return;

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

/* ── LOADER ── */
const Loader = (() => {
  function init() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 800);
        // Init core systems
        initCore();
      }, 3500);
    });
  }

  return { init };
})();

/* ── INIT CORE ── */
function initCore() {
  Cursor.init();
  Particles.init();
  Animations.init();
  Hamburger.init();
  Router.init();
}

document.addEventListener('DOMContentLoaded', () => {
  Loader.init();
  if (!document.getElementById('loader')) initCore();
});
