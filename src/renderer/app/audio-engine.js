(function initMastilAudioEngine() {
  const STORAGE_KEY = 'mastil-sfx-enabled';
  const VOLUME_KEY = 'mastil-sfx-volume';
  const DEFAULT_VOLUME = 42;

  function clampPercent(value, fallback) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.max(0, Math.min(100, Math.round(numeric)));
  }

  const state = {
    context: null,
    master: null,
    enabled: localStorage.getItem(STORAGE_KEY) !== 'false',
    volume: clampPercent(localStorage.getItem(VOLUME_KEY), DEFAULT_VOLUME) / 100,
    installed: false
  };

  function getContext() {
    if (!state.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      state.context = new AudioContext();
      state.master = state.context.createGain();
      state.master.gain.value = state.volume;
      state.master.connect(state.context.destination);
    }
    return state.context;
  }

  function getVolume() {
    return Math.round(state.volume * 100);
  }

  function updateOptionControls() {
    const range = document.getElementById('sfx-volume-range');
    const value = document.getElementById('sfx-volume-value');
    const percent = getVolume();
    if (range && String(range.value) !== String(percent)) range.value = String(percent);
    if (value) value.textContent = `${percent}%`;
  }

  function setVolume(percent, options = {}) {
    const clamped = clampPercent(percent, DEFAULT_VOLUME);
    state.volume = clamped / 100;
    localStorage.setItem(VOLUME_KEY, String(clamped));
    if (state.master) state.master.gain.value = state.volume;
    updateOptionControls();
    if (options.preview !== false && state.enabled) play('select');
  }

  async function unlock() {
    const context = getContext();
    if (context && context.state === 'suspended') {
      try {
        await context.resume();
      } catch {
        return false;
      }
    }
    return Boolean(context);
  }

  function envelope(gain, start, volume, attack, decay) {
    gain.gain.cancelScheduledValues(start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
  }

  function tone(freq, duration, options = {}) {
    if (!state.enabled) return;
    const context = getContext();
    if (!context) return;

    const start = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = options.type || 'sine';
    oscillator.frequency.setValueAtTime(freq, start);
    if (options.to) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, options.to), start + duration);
    }
    envelope(gain, start, options.volume || 0.12, options.attack || 0.012, duration);
    oscillator.connect(gain);
    gain.connect(state.master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  function chord(freqs, duration, options = {}) {
    freqs.forEach((freq, index) => {
      setTimeout(() => tone(freq, duration, {
        ...options,
        volume: (options.volume || 0.09) * (1 - index * 0.06)
      }), index * (options.stagger || 28));
    });
  }

  function noise(duration, options = {}) {
    if (!state.enabled) return;
    const context = getContext();
    if (!context) return;

    const sampleCount = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = options.filter || 'bandpass';
    filter.frequency.value = options.frequency || 900;
    filter.Q.value = options.q || 0.8;
    envelope(gain, context.currentTime, options.volume || 0.12, 0.006, duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(state.master);
    source.start();
  }

  function play(name) {
    if (!state.enabled) return;
    unlock();
    switch (name) {
      case 'menu':
        tone(420, 0.08, { type: 'triangle', to: 560, volume: 0.055 });
        break;
      case 'select':
        chord([360, 540], 0.09, { type: 'triangle', volume: 0.055, stagger: 18 });
        break;
      case 'start':
        chord([196, 294, 392], 0.18, { type: 'sawtooth', volume: 0.06, stagger: 58 });
        break;
      case 'attack':
        noise(0.14, { volume: 0.12, frequency: 1250, q: 1.2 });
        tone(180, 0.12, { type: 'square', to: 90, volume: 0.045 });
        break;
      case 'impact':
        noise(0.09, { volume: 0.08, frequency: 720, q: 0.9 });
        tone(110, 0.08, { type: 'triangle', to: 70, volume: 0.05 });
        break;
      case 'blocked':
        tone(220, 0.1, { type: 'square', to: 165, volume: 0.06 });
        tone(440, 0.08, { type: 'triangle', to: 330, volume: 0.035 });
        break;
      case 'upgrade':
        chord([392, 523, 659], 0.16, { type: 'triangle', volume: 0.07, stagger: 46 });
        break;
      case 'fortify':
        chord([174, 261, 349], 0.18, { type: 'sine', volume: 0.075, stagger: 32 });
        break;
      case 'capture':
        chord([330, 494, 660, 880], 0.2, { type: 'triangle', volume: 0.065, stagger: 48 });
        break;
      case 'achievement':
        chord([392, 587, 784, 1175], 0.24, { type: 'triangle', volume: 0.07, stagger: 42 });
        setTimeout(() => tone(1568, 0.12, { type: 'sine', volume: 0.045 }), 170);
        break;
      case 'wave':
        chord([147, 220, 294, 392], 0.24, { type: 'sawtooth', volume: 0.055, stagger: 70 });
        break;
      case 'gameover':
        chord([220, 165, 110], 0.35, { type: 'sine', volume: 0.08, stagger: 130 });
        break;
      case 'error':
        tone(120, 0.12, { type: 'square', to: 95, volume: 0.06 });
        break;
      default:
        tone(300, 0.08, { volume: 0.05 });
    }
  }

  function updateButtons() {
    document.querySelectorAll('.mastil-sfx-btn').forEach((button) => {
      button.classList.toggle('mastil-audio-on', state.enabled);
      button.classList.toggle('mastil-audio-off', !state.enabled);
      button.title = state.enabled ? 'Soundeffekte aus' : 'Soundeffekte ein';
      button.setAttribute('aria-pressed', String(state.enabled));
      if (!button.querySelector('.mastil-sfx-icon')) {
        button.innerHTML = '<span class="mastil-sfx-icon" aria-hidden="true"></span>';
      }
    });
    updateOptionControls();
  }

  function toggle() {
    state.enabled = !state.enabled;
    localStorage.setItem(STORAGE_KEY, String(state.enabled));
    updateButtons();
    if (state.enabled) play('select');
  }

  function addButton(container, id) {
    if (!container || document.getElementById(id)) return;
    const button = document.createElement('button');
    button.id = id;
    button.type = 'button';
    button.className = 'mastil-sfx-btn mastil-audio-on';
    button.innerHTML = '<span class="mastil-sfx-icon" aria-hidden="true"></span>';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      unlock();
      toggle();
    });
    container.appendChild(button);
  }

  function installOptionControls() {
    const range = document.getElementById('sfx-volume-range');
    if (!range || range.dataset.mastilAudioReady === 'true') {
      updateOptionControls();
      return;
    }
    range.dataset.mastilAudioReady = 'true';
    range.value = String(getVolume());
    range.addEventListener('input', () => setVolume(range.value, { preview: false }));
    range.addEventListener('change', () => setVolume(range.value, { preview: true }));
    updateOptionControls();
  }

  function installButtons() {
    const startButton = document.getElementById('start-music-btn');
    if (startButton && startButton.parentElement) addButton(startButton.parentElement, 'start-sfx-btn');
    const topControls = document.querySelector('.top-bar-controls');
    addButton(topControls, 'sfx-btn');
    updateButtons();
  }

  function wrap(name, soundName, options = {}) {
    const original = window[name];
    if (typeof original !== 'function' || original.__mastilAudioWrapped) return;
    window[name] = function mastilAudioWrapped(...args) {
      if (options.before !== false) play(soundName);
      const result = original.apply(this, args);
      if (options.after) options.after(result, args);
      return result;
    };
    window[name].__mastilAudioWrapped = true;
  }

  function installWrappers() {
    wrap('startGame', 'start');
    wrap('selectFaction', 'select');
    wrap('submitPlayerName', 'start');
    wrap('pauseGame', 'menu');
    wrap('resumeGame', 'select');
    wrap('showLegends', 'menu');
    wrap('showOptions', 'menu');
    wrap('showHighscores', 'menu');
    wrap('showCredits', 'menu');
    wrap('startNextWave', 'wave');
  }

  function init() {
    installButtons();
    installOptionControls();
    installWrappers();
    document.addEventListener('pointerdown', unlock, { once: true, passive: true });
    document.addEventListener('keydown', unlock, { once: true });
  }

  window.MastilAudio = {
    init,
    play,
    toggle,
    unlock,
    setVolume,
    getVolume,
    isEnabled: () => state.enabled
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init);
})();
