/* ═══════════════════════════════════════════
   ROUTER — Dynamic Section Loader
   Curtain transitions between scenes
   ═══════════════════════════════════════════ */

const Router = (() => {
  let current = null;
  let navigating = false;
  const curtain = document.getElementById('curtain');
  const app = document.getElementById('app');
  const cache = {}; // Store loaded HTML sections

  const sceneIds = ['hero', 'lore', 'abilities', 'gallery', 'system', 'chronicle', 'contact'];

  function updateNav(id) {
    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.toggle('active', el.dataset.scene === id);
    });
  }

  function triggerReveal(scene) {
    if (!scene) return;
    setTimeout(() => {
      // Intersection observer check
      Animations.checkReveals(scene);
      // Re-init specific animations if needed
      if (scene.id === 'scene-hero') GlyphWriter.init();
      if (scene.id === 'scene-gallery') Carousel.init('carousel-gallery');
      if (scene.id === 'scene-system') {
        Pipeline.init();
        MoodBars.init();
      }
    }, 50);
  }

  async function loadScene(id) {
    if (cache[id]) return cache[id];

    try {
      const response = await fetch(`sections/${id}.html`);
      const html = await response.text();
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const section = temp.firstElementChild;
      cache[id] = section;
      return section;
    } catch (err) {
      console.error(`Failed to load scene: ${id}`, err);
      return null;
    }
  }

  async function navigate(id, pushState = true) {
    if (current === id) return;
    if (!sceneIds.includes(id)) return;
    if (navigating) return;
    navigating = true;

    // Stoppe les animations de scène en cours
    if (current === 'system') Pipeline.destroy();
    if (current === 'gallery') Carousel.destroy();

    // Tue les tweens curtain en cours + reset position
    gsap.killTweensOf(curtain);
    gsap.set(curtain, { y: '-100%' });

    // Fetch + curtain down en parallèle
    const sectionPromise = loadScene(id);
    gsap.to(curtain, {
      y: '0%',
      duration: 0.48,
      ease: 'power2.inOut',
      onComplete: async () => {
        const newSection = await sectionPromise;
        if (!newSection) {
          gsap.to(curtain, { y: '-100%', duration: 0.48, ease: 'power2.inOut',
            onComplete: () => { navigating = false; } });
          return;
        }

        app.innerHTML = '';
        app.appendChild(newSection);

        requestAnimationFrame(() => {
          newSection.classList.add('active');
          newSection.scrollTop = 0;
          ProgressBar.initForScene(newSection);

          current = id;
          updateNav(id);
          if (pushState) history.pushState({ scene: id }, '', `#${id}`);
          triggerReveal(newSection);

          // Curtain up (sort par le bas)
          gsap.to(curtain, { y: '100%', duration: 0.48, ease: 'power2.inOut',
            onComplete: () => { navigating = false; } });
        });
      }
    });
  }

  function init() {
    // Nav links
    document.querySelectorAll('[data-scene]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const id = el.dataset.scene;
        navigate(id);
        // Close mobile menu
        document.getElementById('mobile-menu')?.classList.remove('open');
        document.getElementById('nav-burger')?.classList.remove('open');
      });
    });

    // Handle back/forward
    window.addEventListener('popstate', (e) => {
      const id = e.state?.scene || 'hero';
      navigate(id, false);
    });

    // Initial scene from hash or default
    const hash = window.location.hash.replace('#', '');
    const initial = sceneIds.includes(hash) ? hash : 'hero';
    navigate(initial, false);
  }

  return { navigate, init, current: () => current };
})();

/* ── PROGRESS BAR (scroll within scene) ── */
const ProgressBar = (() => {
  const bar = document.getElementById('progress-bar');

  function update(scene) {
    if (!scene || !bar) return;
    const { scrollTop, scrollHeight, clientHeight } = scene;
    const pct = scrollHeight <= clientHeight ? 0 :
      (scrollTop / (scrollHeight - clientHeight)) * 100;
    bar.style.width = pct + '%';
  }

  function reset() {
    if (bar) bar.style.width = '0%';
  }

  function initForScene(scene) {
    reset();
    scene.addEventListener('scroll', () => update(scene));
    // Initial check
    update(scene);

    // Also update NavScroll state
    const nav = document.getElementById('nav');
    scene.addEventListener('scroll', () => {
      nav?.classList.toggle('scrolled', scene.scrollTop > 20);
    });
  }

  return { update, reset, initForScene };
})();
