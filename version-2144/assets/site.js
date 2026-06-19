const Hls = window.Hls;

function initMobileNav() {
  const button = document.querySelector('[data-mobile-menu-button]');
  const nav = document.querySelector('[data-mobile-nav]');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    const isOpen = nav.hasAttribute('hidden') === false;
    nav.toggleAttribute('hidden', isOpen);
    button.setAttribute('aria-expanded', String(!isOpen));
  });
}

function initHeroCarousel() {
  const hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));

  if (slides.length <= 1) {
    return;
  }

  let activeIndex = 0;
  let timer = window.setInterval(showNext, 5200);

  function setActive(index) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  function showNext() {
    setActive(activeIndex + 1);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      window.clearInterval(timer);
      setActive(index);
      timer = window.setInterval(showNext, 5200);
    });
  });
}

function initCategoryFilter() {
  const panel = document.querySelector('[data-filter-panel]');
  const grid = document.querySelector('[data-filter-grid]');

  if (!panel || !grid) {
    return;
  }

  const searchInput = panel.querySelector('[data-category-search]');
  const typeFilter = panel.querySelector('[data-type-filter]');
  const yearFilter = panel.querySelector('[data-year-filter]');
  const resetButton = panel.querySelector('[data-filter-reset]');
  const count = document.querySelector('[data-filter-count]');
  const cards = Array.from(grid.querySelectorAll('[data-card]'));

  function applyFilter() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const type = typeFilter?.value || '';
    const year = yearFilter?.value || '';
    let visible = 0;

    cards.forEach((card) => {
      const matchesQuery = !query || (card.dataset.search || '').includes(query);
      const matchesType = !type || card.dataset.type === type;
      const matchesYear = !year || card.dataset.year === year;
      const shouldShow = matchesQuery && matchesType && matchesYear;

      card.toggleAttribute('hidden', !shouldShow);

      if (shouldShow) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = `当前显示 ${visible} 部影片`;
    }
  }

  [searchInput, typeFilter, yearFilter].forEach((control) => {
    if (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    }
  });

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (typeFilter) typeFilter.value = '';
      if (yearFilter) yearFilter.value = '';
      applyFilter();
    });
  }
}

function createSearchCard(movie) {
  return `
    <article class="video-card">
      <a class="card-link" href="${movie.url}" aria-label="观看 ${escapeHtml(movie.title)}">
        <span class="image-shell">
          <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
          <span class="image-overlay"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg></span>
          <span class="duration-badge">${escapeHtml(movie.duration)}</span>
          <span class="region-badge">${escapeHtml(movie.category)}</span>
        </span>
        <span class="card-content">
          <span class="card-title">${escapeHtml(movie.title)}</span>
          <span class="card-desc">${escapeHtml(movie.oneLine)}</span>
          <span class="card-meta">
            <span>${escapeHtml(movie.year)}</span>
            <span>${escapeHtml(movie.region)}</span>
            <span>${escapeHtml(movie.rating)} 分</span>
          </span>
          <span class="card-tags">${movie.tags.slice(0, 3).map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join('')}</span>
        </span>
      </a>
    </article>
  `;
}

function initSearchPage() {
  const form = document.querySelector('[data-search-form]');
  const input = document.querySelector('[data-search-input]');
  const summary = document.querySelector('[data-search-summary]');
  const resultBox = document.querySelector('[data-search-results]');
  const sortSelect = document.querySelector('[data-search-sort]');

  if (!form || !input || !summary || !resultBox || !window.MOVIE_SEARCH_DATA) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  input.value = initialQuery;

  function render() {
    const query = input.value.trim().toLowerCase();
    const sort = sortSelect?.value || 'relevance';
    let results = [];

    if (query) {
      results = window.MOVIE_SEARCH_DATA.filter((movie) => movie.search.includes(query));
    }

    if (sort === 'rating') {
      results.sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (sort === 'views') {
      results.sort((a, b) => Number(b.views) - Number(a.views));
    } else if (sort === 'year') {
      results.sort((a, b) => Number(b.yearNumber) - Number(a.yearNumber));
    }

    if (!query) {
      summary.textContent = '请输入关键词开始搜索。';
      resultBox.innerHTML = '';
      return;
    }

    summary.textContent = `搜索“${input.value.trim()}”共找到 ${results.length} 部影片。`;
    resultBox.innerHTML = results.slice(0, 240).map(createSearchCard).join('');
    initImageFallbacks(resultBox);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    const url = query ? `search.html?q=${encodeURIComponent(query)}` : 'search.html';
    window.history.replaceState(null, '', url);
    render();
  });

  input.addEventListener('input', render);

  if (sortSelect) {
    sortSelect.addEventListener('change', render);
  }

  render();
}

function initMoviePlayer() {
  const video = document.querySelector('[data-hls-player]');
  const frame = document.querySelector('[data-player-frame]');
  const trigger = document.querySelector('[data-player-trigger]');
  const message = document.querySelector('[data-player-message]');

  if (!video || !frame) {
    return;
  }

  const source = video.dataset.src || video.currentSrc || video.getAttribute('src');
  let hls = null;
  let hlsReady = false;

  function showMessage(text) {
    if (!message) {
      return;
    }

    message.textContent = text;
    message.hidden = false;
  }

  function setupHls() {
    if (!source) {
      showMessage('当前影片没有可用播放源。');
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        hlsReady = true;
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          showMessage('网络错误，正在尝试重新加载播放源。');
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          showMessage('媒体错误，正在尝试恢复播放。');
          hls.recoverMediaError();
        } else {
          showMessage('播放器暂时无法加载该播放源。');
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      hlsReady = true;
    } else {
      showMessage('当前浏览器不支持 HLS 播放，请使用最新版 Chrome、Edge、Safari 或移动端浏览器。');
    }
  }

  async function playVideo() {
    frame.classList.add('is-playing');

    try {
      if (!hlsReady && video.readyState < 2) {
        video.load();
      }

      await video.play();
    } catch (error) {
      frame.classList.remove('is-playing');
      showMessage('浏览器阻止了自动播放，请再次点击播放器或使用原生播放控件。');
    }
  }

  setupHls();

  if (trigger) {
    trigger.addEventListener('click', playVideo);
  }

  video.addEventListener('play', () => frame.classList.add('is-playing'));
  video.addEventListener('pause', () => frame.classList.remove('is-playing'));

  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
    }
  });
}

function initImageFallbacks(root = document) {
  const images = Array.from(root.querySelectorAll('img'));

  images.forEach((image) => {
    if (image.dataset.fallbackReady === 'true') {
      return;
    }

    image.dataset.fallbackReady = 'true';

    image.addEventListener('error', () => {
      image.classList.add('image-missing');
      image.removeAttribute('src');
    });
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHeroCarousel();
  initCategoryFilter();
  initSearchPage();
  initMoviePlayer();
  initImageFallbacks();
});
