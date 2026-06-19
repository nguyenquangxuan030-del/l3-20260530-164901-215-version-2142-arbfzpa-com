
import { H as Hls } from './video-player-dru42stk.js';

function normalize(s) {
  return (s || '').toString().toLowerCase();
}

function applyFilter(input, scope) {
  const q = normalize(input.value.trim());
  const cards = scope.querySelectorAll('[data-card]');
  let visible = 0;
  cards.forEach((card) => {
    const hay = normalize([
      card.dataset.title,
      card.dataset.tags,
      card.dataset.genre,
      card.dataset.region,
      card.textContent,
    ].join(' '));
    const show = !q || hay.includes(q);
    card.style.display = show ? '' : 'none';
    if (show) visible += 1;
  });
  const empty = scope.querySelector('[data-empty-state]');
  if (empty) empty.style.display = visible ? 'none' : 'block';
}

function initSearch() {
  document.querySelectorAll('[data-search-input]').forEach((input) => {
    const scope = input.closest('[data-search-scope]') || document;
    input.addEventListener('input', () => applyFilter(input, scope));
    input.addEventListener('search', () => applyFilter(input, scope));
    applyFilter(input, scope);
  });
}

function sortCards(grid, mode) {
  const cards = Array.from(grid.querySelectorAll('[data-card]'));
  cards.sort((a, b) => {
    const aYear = Number(a.dataset.year || 0);
    const bYear = Number(b.dataset.year || 0);
    const aScore = Number(a.dataset.score || 0);
    const bScore = Number(b.dataset.score || 0);
    const aTitle = (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-CN');
    if (mode === 'latest') return bYear - aYear || bScore - aScore;
    if (mode === 'popular') return bScore - aScore || bYear - aYear;
    if (mode === 'title') return aTitle;
    return 0;
  });
  cards.forEach((card) => grid.appendChild(card));
}

function initSorting() {
  document.querySelectorAll('[data-sort-scope]').forEach((scope) => {
    const grid = scope.querySelector('[data-sort-grid]');
    if (!grid) return;
    scope.querySelectorAll('[data-sort]').forEach((btn) => {
      btn.addEventListener('click', () => {
        scope.querySelectorAll('[data-sort]').forEach((x) => x.classList.remove('is-active'));
        btn.classList.add('is-active');
        sortCards(grid, btn.dataset.sort);
      });
    });
  });
}

function initCarousel() {
  document.querySelectorAll('[data-hero-carousel]').forEach((carousel) => {
    const cards = carousel.querySelectorAll('.movie-card');
    if (!cards.length) return;
    let i = 0;
    setInterval(() => {
      i = (i + 1) % cards.length;
      cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }, 4200);
  });
}

function initPlayer() {
  document.querySelectorAll('video[data-hls]').forEach((video) => {
    const hlsSrc = video.dataset.hls;
    const fallback = video.dataset.fallback || '';
    if (!hlsSrc) return;
    const nativeHls = video.canPlayType('application/vnd.apple.mpegurl');
    if (nativeHls) {
      video.src = hlsSrc;
      return;
    }
    if (Hls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(hlsSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data && data.fatal && fallback) video.src = fallback;
      });
      return;
    }
    if (fallback) video.src = fallback;
  });
}

function updateCurrentYear() {
  document.querySelectorAll('[data-current-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

initSearch();
initSorting();
initCarousel();
initPlayer();
updateCurrentYear();
