// Go Fish for a Team Mate — vanilla JS
// - Input: two name lists (one per line)
// - Flow: start -> for each fisherman -> GO FISH -> random fish after <=10s -> pair -> next
// - End: show all pairs, allow play again

(() => {
  const qs = (sel) => document.querySelector(sel);
  const CATCH_DISPLAY_MS = 3000; // show catch result for 3s
  const LS_KEY_FISHERMEN = 'gofish.fishermen';
  const LS_KEY_FISH = 'gofish.fish';

  const el = {
    setup: qs('#setup'),
    fishermenInput: qs('#fishermenInput'),
    fishInput: qs('#fishInput'),
    startBtn: qs('#startBtn'),
    play: qs('#play'),
    currentFisherman: qs('#currentFisherman'),
    goFishBtn: qs('#goFishBtn'),
    castStatus: qs('#castStatus'),
    castMessage: qs('#castMessage'),
    countdown: qs('#countdown'),
    catchResult: qs('#catchResult'),
    results: qs('#results'),
    pairsList: qs('#pairsList'),
    playAgainBtn: qs('#playAgainBtn'),
    fishLayer: qs('.fish-layer'),
    rod: qs('.rod'),
    get line() { return this.rod ? this.rod.querySelector('.line') : null; },
    cloudLayer: qs('.cloud-layer'),
  };

  // State
  let fishermen = [];
  let fish = [];
  let fishermenOrder = [];
  let pairs = [];
  let currentIndex = 0;
  let isCasting = false;
  let initialized = false;

  // Helpers
  function parseNames(text) {
    return (text || '')
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);
  }
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function pickRandomFish() {
    if (fish.length === 0) return null;
    const idx = Math.floor(Math.random() * fish.length);
    const [name] = fish.splice(idx, 1);
    return name;
  }

  // UI control
  function resetUI() {
    el.setup.classList.remove('hidden');
    el.play.classList.add('hidden');
    el.results.classList.add('hidden');
    el.catchResult.classList.add('hidden');
    el.castStatus.classList.add('hidden');
    el.countdown.textContent = '';
    el.countdown.classList.add('hidden');
    el.castMessage.textContent = 'Casting the line…';
    el.goFishBtn.disabled = false;
    el.goFishBtn.classList.remove('hidden');
    if (el.rod) el.rod.classList.add('hidden');
    if (el.line) el.line.classList.add('hidden');
    stopMusic();
  }

  function startGame() {
    saveTeams();
    fishermen = parseNames(el.fishermenInput.value);
    fish = parseNames(el.fishInput.value);
    if (fishermen.length === 0 || fish.length === 0) {
      alert('Please enter at least one name for each team.');
      return;
    }
    fishermenOrder = shuffle([...fishermen]);
    pairs = [];
    currentIndex = 0;

    el.setup.classList.add('hidden');
    el.play.classList.remove('hidden');
    el.results.classList.add('hidden');
    startMusic();
    nextTurn();
  }

  function nextTurn() {
    el.catchResult.classList.add('hidden');
    el.castStatus.classList.add('hidden');
    el.goFishBtn.disabled = false;
    el.goFishBtn.classList.remove('hidden');
    if (el.line) el.line.classList.add('hidden');
    if (el.rod) el.rod.classList.add('hidden');
    el.castMessage.textContent = 'Casting the line…';

    if (currentIndex >= fishermenOrder.length || fish.length === 0) {
      endGame();
      return;
    }
    el.currentFisherman.textContent = fishermenOrder[currentIndex];
    renderFishSprites();
  }

  function goFish() {
    if (isCasting) return;
    el.goFishBtn.disabled = true;
    el.goFishBtn.classList.add('hidden');
    if (el.rod) el.rod.classList.remove('hidden');
    if (el.line) el.line.classList.remove('hidden');
    playSplash();

    el.countdown.textContent = '';
    el.countdown.classList.add('hidden');
    el.castMessage.textContent = 'Waiting for a nibble...';
    isCasting = true;

    const duration = randomInt(1500, 10000);
    setTimeout(() => {
      isCasting = false;
      el.countdown.textContent = '';
      el.castMessage.textContent = 'Casting the line…';

      const fishName = pickRandomFish();
      if (!fishName) { endGame(); return; }
      const fisherName = fishermenOrder[currentIndex];
      pairs.push([fisherName, fishName]);

      removeOneFishSprite();

      el.catchResult.textContent = `${fisherName} caught ${fishName}!`;
      el.catchResult.classList.remove('hidden');

      currentIndex += 1;
      setTimeout(nextTurn, CATCH_DISPLAY_MS);
    }, duration);
  }

  function endGame() {
    el.play.classList.add('hidden');
    el.results.classList.remove('hidden');
    if (el.line) el.line.classList.add('hidden');
    if (el.rod) el.rod.classList.add('hidden');
    renderPairs();
    stopMusic();
  }

  function renderPairs() {
    el.pairsList.innerHTML = '';
    for (const [fisher, caught] of pairs) {
      const li = document.createElement('li');
      li.textContent = `${fisher} + ${caught}`;
      el.pairsList.appendChild(li);
    }
  }

  function playAgain() {
    resetUI();
  }

  // Visual fish rendering
  function renderFishSprites() {
    if (!el.fishLayer) return;
    el.fishLayer.innerHTML = '';
    const rect = el.fishLayer.getBoundingClientRect();
    const pxVar = getComputedStyle(document.documentElement).getPropertyValue('--px').trim();
    const pxUnit = parseFloat(pxVar || '6');
    const fishHeightPx = pxUnit * 2; // matches .fish height
    const bottomClearancePx = pxUnit * 2; // few pixels above seabed
    const surfaceClearancePx = pxUnit * 2; // keep off the surface
    const minTopPx = surfaceClearancePx;
    const maxTopPx = Math.max(minTopPx, rect.height - fishHeightPx - bottomClearancePx);
    const count = Math.max(0, fish.length);
    for (let i = 0; i < count; i++) {
      const f = document.createElement('div');
      f.className = 'fish swim';
      const body = document.createElement('div'); body.className = 'body';
      const tail = document.createElement('div'); tail.className = 'tail';
      const eye = document.createElement('div'); eye.className = 'eye';
      f.append(body, tail, eye);

      const fishWidthPx = pxUnit * 4;
      const minLeftPx = 0;
      const maxLeftPx = Math.max(0, rect.width - fishWidthPx);
      const startLeftPx = minLeftPx + Math.random() * (maxLeftPx - minLeftPx);
      const endLeftPx = minLeftPx + Math.random() * (maxLeftPx - minLeftPx);
      const topPx = minTopPx + Math.random() * (maxTopPx - minTopPx);
      f.style.top = `${topPx}px`;
      f.style.left = `${startLeftPx}px`;
      const duration = 6 + Math.random() * 8;
      f.style.setProperty('--swim-duration', `${duration}s`);
      f.style.setProperty('--swim-to', `${endLeftPx}px`);
      el.fishLayer.appendChild(f);
    }
  }

  function removeOneFishSprite() {
    if (!el.fishLayer) return;
    const sprite = el.fishLayer.querySelector('.fish');
    if (sprite) sprite.remove();
  }

  window.addEventListener('resize', debounce(() => {
    if (!el.play.classList.contains('hidden')) {
      renderFishSprites();
    }
  }, 200));

  // --- Audio: Web Audio context + splash ---
  let audioCtx = null;
  function getAudioCtx() {
    try { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
    return audioCtx;
  }
  async function playSplash() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') { try { await ctx.resume(); } catch {} }

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.16, now);
    master.connect(ctx.destination);

    const noiseDur = 0.22;
    const bufferSize = Math.floor(ctx.sampleRate * noiseDur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1200, now);
    bp.Q.setValueAtTime(0.8, now);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(1.0, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + noiseDur);
    noise.connect(bp).connect(nGain).connect(master);
    noise.start(now);
    noise.stop(now + noiseDur);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.18);
    const oGain = ctx.createGain();
    oGain.gain.setValueAtTime(0.25, now);
    oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(oGain).connect(master);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // --- Background music: file-based BGM with seagulls ---
  const musicState = { playing: false, bgm: null };
  const BGM_FILE = "Reel 'Em In.mp3"; // file is in src/

  async function startMusic() {
    if (musicState.playing) return;
    if (!musicState.bgm) {
      const audio = new Audio();
      audio.src = encodeURI(BGM_FILE);
      audio.loop = true;
      audio.volume = 0.25;
      musicState.bgm = audio;
    }
  try { await musicState.bgm.play(); } catch {}
  musicState.playing = true;
  }

  function stopMusic() {
    if (!musicState.playing) return;
    try { musicState.bgm && musicState.bgm.pause(); } catch {}
    musicState.playing = false;
  }

  // Wire events
  el.startBtn.addEventListener('click', startGame);
  el.goFishBtn.addEventListener('click', goFish);
  el.playAgainBtn.addEventListener('click', playAgain);

  // Persistence
  function lsGet(key, fallback = '') { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } }
  function lsSet(key, value) { try { localStorage.setItem(key, value); } catch {} }
  function saveTeams() {
    lsSet(LS_KEY_FISHERMEN, el.fishermenInput.value || '');
    lsSet(LS_KEY_FISH, el.fishInput.value || '');
  }
  function loadTeams() {
    const savedFishermen = lsGet(LS_KEY_FISHERMEN, '');
    const savedFish = lsGet(LS_KEY_FISH, '');
    if (savedFishermen) el.fishermenInput.value = savedFishermen;
    if (savedFish) el.fishInput.value = savedFish;
  }
  function debounce(fn, wait = 300) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); }; }
  const autoSave = debounce(saveTeams, 300);
  el.fishermenInput.addEventListener('input', autoSave);
  el.fishInput.addEventListener('input', autoSave);

  // Initial view
  resetUI();
  if (!initialized) { loadTeams(); initialized = true; }

  // Clouds
  function spawnClouds(n = 3) {
    if (!el.cloudLayer) return;
    el.cloudLayer.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      c.className = 'cloud ' + (i % 3 === 0 ? 'slow' : i % 3 === 1 ? 'med' : 'fast');
      const topPx = 4 + Math.floor(Math.random() * 10) * 6;
      c.style.top = `${topPx}px`;
      c.style.animationDelay = `${-Math.random() * 60}s`;
      const a = document.createElement('div'); a.className = 'p a';
      const b = document.createElement('div'); b.className = 'p b';
      const d = document.createElement('div'); d.className = 'p c';
      c.append(a, b, d);
      el.cloudLayer.appendChild(c);
    }
  }
  spawnClouds(4);
})();
