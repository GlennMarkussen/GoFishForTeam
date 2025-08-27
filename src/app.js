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

  if (currentIndex >= fishermenOrder.length || fish.length === 0) {
      endGame();
      return;
    }
  el.currentFisherman.textContent = fishermenOrder[currentIndex];
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
      el.castMessage.textContent = 'A fish is on the hook!';

      const fishName = pickRandomFish();
      const fisherName = fishermenOrder[currentIndex];
      pairs.push([fisherName, fishName]);

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
})();
