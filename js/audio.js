/* ═══════════════════════════════════════════════════
   SOUND SYSTEM — Music + SFX
   Natsume Tsurugi
   · background : assets/ambiance.mp3 (loop)
   · sfx        : void-tear whoosh on scene transitions
   ═══════════════════════════════════════════════════ */

const SoundSystem = (() => {
  let ctx, masterGain, audioEl;
  let muted = localStorage.getItem('nt-muted') === '1';
  let built = false;

  /* ── Build audio graph ── */
  function build() {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { return; }

    /* Music element */
    audioEl = document.createElement('audio');
    audioEl.src     = 'assets/ambiance.mp3';
    audioEl.loop    = true;
    audioEl.preload = 'auto';
    audioEl.crossOrigin = 'anonymous';

    const source = ctx.createMediaElementSource(audioEl);

    masterGain = ctx.createGain();
    masterGain.gain.value = 0;

    source.connect(masterGain);
    masterGain.connect(ctx.destination);

    built = true;
  }

  /* ── Fades ── */
  function fadeIn() {
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    audioEl.play().catch(() => {});
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setTargetAtTime(0.75, ctx.currentTime, 3.0);
  }

  function fadeOut() {
    if (!ctx) return;
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setTargetAtTime(0, ctx.currentTime, 1.5);
  }

  /* ── Button state ── */
  function updateBtn() {
    const btn = document.getElementById('audio-btn');
    if (!btn) return;
    btn.classList.toggle('muted', muted);
    btn.setAttribute('title', muted ? 'Enable ambiance' : 'Mute ambiance');
  }

  /* ── Toggle ── */
  function toggle() {
    muted = !muted;
    localStorage.setItem('nt-muted', muted ? '1' : '0');
    muted ? fadeOut() : fadeIn();
    updateBtn();
  }

  /* ── Init ── */
  function init() {
    updateBtn();

    /* Build + start on first user gesture (browser policy) */
    document.addEventListener('pointerdown', () => {
      if (!built) {
        build();
        if (!muted) fadeIn();
      } else if (!muted && ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
    }, { once: true });

    document.getElementById('audio-btn')
      ?.addEventListener('click', e => { e.stopPropagation(); toggle(); });
  }

  return { init, toggle };
})();
