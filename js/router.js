/* ═══════════════════════════════════════════
   ROUTER — SPA Section Switching
   Curtain transitions between scenes
   ═══════════════════════════════════════════ */

const Router = (() => {
  let current = null;
  const curtain = document.getElementById('curtain');

  const scenes = {
    hero:     document.getElementById('scene-hero'),
    lore:     document.getElementById('scene-lore'),
    abilities:document.getElementById('scene-abilities'),
    gallery:  document.getElementById('scene-gallery'),
    system:   document.getElementById('scene-system'),
    chronicle:document.getElementById('scene-chronicle'),
    contact:  document.getElementById('scene-contact'),
  };

  function updateNav(id) {
    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.toggle('active', el.dataset.scene === id);
    });
  }

  function scrollToTop(id) {
    const scene = scenes[id];
    if (scene) scene.scrollTop = 0;
  }

  function triggerReveal(id) {
    const scene = scenes[id];
    if (!scene) return;
    // Small delay to let scene become visible first
    setTimeout(() => {
      scene.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el, i) => {
        // Reset
        el.classList.remove('visible');
        // Re-trigger via intersection observer (handled in animations.js)
      });
      // Fire reveal for elements already in viewport
      Animations.checkReveals(scene);
    }, 50);
  }

  function navigate(id, pushState = true) {
    if (current === id) return;
    if (!scenes[id]) return;

    // Curtain down
    curtain.classList.remove('up');
    curtain.classList.add('down');

    setTimeout(() => {
      // Hide current
      if (current && scenes[current]) {
        scenes[current].classList.remove('active');
      }

      // Show new
      current = id;
      scenes[id].classList.add('active');
      scrollToTop(id);
      updateNav(id);

      // Update URL hash
      if (pushState) {
        history.pushState({ scene: id }, '', `#${id}`);
      }

      // Curtain up
      curtain.classList.remove('down');
      curtain.classList.add('up');

      // Trigger reveals
      triggerReveal(id);

      // Update progress bar
      ProgressBar.reset();

    }, 480); // matches curtain animation duration
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
    const initial = scenes[hash] ? hash : 'hero';
    current = null;
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

  function init() {
    document.querySelectorAll('.scene').forEach(scene => {
      scene.addEventListener('scroll', () => update(scene));
    });
  }

  return { update, reset, init };
})();
