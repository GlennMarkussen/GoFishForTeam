// Go Fish for a Team Mate — vanilla JS skeleton
// Contract
// - Input: two name lists (one per line)
// - Flow: start -> for each fisherman -> press GO FISH -> random fish after <=10s -> pair -> next
// - End: show all pairs, allow play again

(() => {
  const qs = (sel) => document.querySelector(sel);
  // How long to display the caught fish result before proceeding (ms)
  const CATCH_DISPLAY_MS = 3000;
  // LocalStorage keys
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
  get line(){ return this.rod ? this.rod.querySelector('.line') : null; },
  cloudLayer: qs('.cloud-layer'),
  };

  /** State */
  let fishermen = [];
  let fishermenOrder = [];
  let fish = [];
  let pairs = [];
  let currentIndex = 0;
  let isCasting = false;
  let initialized = false;

  function parseNames(text) {
    return text
      .split(/\r?\n/) // lines
      .map((s) => s.trim())
      .filter(Boolean);
  }

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
    nextTurn();
  }

  function nextTurn() {
    el.catchResult.classList.add('hidden');
  el.castStatus.classList.add('hidden');
  el.goFishBtn.disabled = false;
  el.goFishBtn.classList.remove('hidden');
  if (el.line) el.line.classList.add('hidden');
  if (el.rod) el.rod.classList.add('hidden');
  // While waiting to click GO FISH, show idle message
  el.castMessage.textContent = 'Casting the line…';

  if (currentIndex >= fishermenOrder.length || fish.length === 0) {
      endGame();
      return;
    }
  el.currentFisherman.textContent = fishermenOrder[currentIndex];
  renderFishSprites();
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickRandomFish() {
    const i = randomInt(0, fish.length - 1);
    return fish.splice(i, 1)[0]; // remove and return
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function goFish() {
    if (isCasting) return; // avoid double clicks

    el.castStatus.classList.remove('hidden');
    el.catchResult.classList.add('hidden');
  el.goFishBtn.disabled = true;
  el.goFishBtn.classList.add('hidden');
  if (el.rod) el.rod.classList.remove('hidden');
  if (el.line) el.line.classList.remove('hidden');

    const maxMs = 10_000;
    const minMs = 1_500;
    const duration = randomInt(minMs, maxMs);

  // Hide countdown to keep timing a surprise
  el.countdown.textContent = '';
  el.countdown.classList.add('hidden');
  el.castMessage.textContent = 'Waiting for a nibble...';
    isCasting = true;

    setTimeout(() => {
      isCasting = false;
  el.countdown.textContent = '';
  // Keep the idle text rather than showing a bite message
  el.castMessage.textContent = 'Casting the line…';

      const fishName = pickRandomFish();
      const fisherName = fishermenOrder[currentIndex];
      pairs.push([fisherName, fishName]);

  // Remove one visible fish sprite to reflect the catch
  removeOneFishSprite();

      el.catchResult.textContent = `${fisherName} caught ${fishName}!`;
      el.catchResult.classList.remove('hidden');

      currentIndex += 1;

      // Next turn after showing the catch result
      setTimeout(nextTurn, CATCH_DISPLAY_MS);
    }, duration);
  }

  function endGame() {
    el.play.classList.add('hidden');
    el.results.classList.remove('hidden');
  if (el.line) el.line.classList.add('hidden');
  if (el.rod) el.rod.classList.add('hidden');
    renderPairs();
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
    // Keep previous inputs for convenience
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
    const bottomClearancePx = pxUnit * 2; // "a few pixels" above seabed
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
      // Random position within water bounds, using pixel clearance from seabed
  // Horizontal constraints: keep fish fully inside layer
  const fishWidthPx = pxUnit * 4;
  const minLeftPx = 0;
  const maxLeftPx = Math.max(0, rect.width - fishWidthPx);
  const startLeftPx = minLeftPx + Math.random() * (maxLeftPx - minLeftPx);
  const endLeftPx = minLeftPx + Math.random() * (maxLeftPx - minLeftPx);
      const topPx = minTopPx + Math.random() * (maxTopPx - minTopPx);
  f.style.top = `${topPx}px`;
  f.style.left = `${startLeftPx}px`;
  // Random swim duration and bounds
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

  // Recalculate fish positions on resize to keep seabed clearance
  window.addEventListener('resize', debounce(() => {
    // Only re-render when the play section is visible
    if (!el.play.classList.contains('hidden')) {
      renderFishSprites();
    }
  }, 200));

  // Wire events
  el.startBtn.addEventListener('click', startGame);
  el.goFishBtn.addEventListener('click', goFish);
  el.playAgainBtn.addEventListener('click', playAgain);

  // Persistence helpers
  function lsGet(key, fallback = '') {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  }
  function lsSet(key, value) {
    try { localStorage.setItem(key, value); } catch { /* ignore quota/blocked */ }
  }

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

  // Debounced auto-save on input
  function debounce(fn, wait = 300) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  }
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
      // vary vertical position inside the sky area
      const topPx = 4 + Math.floor(Math.random() * 10) * 6; // multiples of --px
      c.style.top = `${topPx}px`;
      // random start offset into the animation so they are spread out
      c.style.animationDelay = `${-Math.random() * 60}s`;
      // cloud puffs
      const a = document.createElement('div'); a.className = 'p a';
      const b = document.createElement('div'); b.className = 'p b';
      const d = document.createElement('div'); d.className = 'p c';
      c.append(a,b,d);
      el.cloudLayer.appendChild(c);
    }
  }
  spawnClouds(4);
})();
