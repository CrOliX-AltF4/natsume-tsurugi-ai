/* ═══════════════════════════════════════════
   ROUTER — Dynamic Section Loader
   Curtain transitions between scenes
   ═══════════════════════════════════════════ */

const Router = (() => {
  let current = null;
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

    // Curtain down
    curtain.classList.remove('up');
    curtain.classList.add('down');

    // Preload
    const newSection = await loadScene(id);
    if (!newSection) {
      curtain.classList.remove('down');
      curtain.classList.add('up');
      return;
    }

    setTimeout(() => {
      // Remove current section from DOM but keep in cache
      app.innerHTML = '';

      // Add new section
      app.appendChild(newSection);

      // Trigger activation
      requestAnimationFrame(() => {
        newSection.classList.add('active');
        newSection.scrollTop = 0;
        
        // Init scroll progress for the new scene
        ProgressBar.initForScene(newSection);
        
        // Curtain up
        curtain.classList.remove('down');
        curtain.classList.add('up');

        // Update state
        current = id;
        updateNav(id);
        if (pushState) history.pushState({ scene: id }, '', `#${id}`);

        // Trigger reveals and specific inits
        triggerReveal(newSection);
      });

    }, 480);
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
