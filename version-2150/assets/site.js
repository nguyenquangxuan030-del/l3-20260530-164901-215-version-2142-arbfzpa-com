(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.addEventListener('error', function (event) {
    var target = event.target;

    if (target && target.classList && target.classList.contains('poster-image')) {
      var wrapper = target.closest('.poster-wrap');

      if (wrapper) {
        wrapper.classList.add('poster-missing');
      }
    }

    if (target && target.classList && target.classList.contains('hero-bg')) {
      target.style.opacity = '0';
    }
  }, true);

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-go-slide]'));
  var activeSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  function nextSlide() {
    showSlide(activeSlide + 1);
  }

  function startSlider() {
    if (slides.length > 1) {
      timer = window.setInterval(nextSlide, 5200);
    }
  }

  function resetSlider() {
    if (timer) {
      window.clearInterval(timer);
    }

    startSlider();
  }

  var nextButton = document.querySelector('.hero-next');
  var prevButton = document.querySelector('.hero-prev');

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      nextSlide();
      resetSlider();
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      showSlide(activeSlide - 1);
      resetSlider();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.dataset.goSlide || 0));
      resetSlider();
    });
  });

  startSlider();

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyLocalFilter(scope) {
    var input = scope.querySelector('.local-filter');
    var list = document.querySelector('.local-filter-list');
    var activeYear = 'all';

    if (!input || !list) {
      return;
    }

    function run() {
      var keyword = normalize(input.value);
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-title]'));

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        var yearMatched = activeYear === 'all' || card.dataset.year === activeYear;
        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;

        card.classList.toggle('is-hidden-by-filter', !(yearMatched && keywordMatched));
      });
    }

    input.addEventListener('input', run);

    scope.querySelectorAll('[data-year-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.dataset.yearFilter || 'all';
        scope.querySelectorAll('[data-year-filter]').forEach(function (otherButton) {
          otherButton.classList.toggle('is-active', otherButton === button);
        });
        run();
      });
    });
  }

  document.querySelectorAll('[data-filter-scope]').forEach(applyLocalFilter);

  document.querySelectorAll('[data-player]').forEach(function (playerShell) {
    var video = playerShell.querySelector('video');
    var startButton = playerShell.querySelector('.player-start');

    if (!video) {
      return;
    }

    function attachSource() {
      var source = video.dataset.src;

      if (!source || video.dataset.ready === 'true') {
        return;
      }

      if (source.indexOf('.m3u8') !== -1 && window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      video.dataset.ready = 'true';
    }

    function playVideo() {
      attachSource();
      playerShell.classList.add('is-started');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    video.addEventListener('click', attachSource, { once: true });
    video.addEventListener('play', attachSource, { once: true });

    if (startButton) {
      startButton.addEventListener('click', playVideo);
    }
  });

  var backTop = document.querySelector('.back-top');

  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function renderSearchResults(results) {
    var container = document.getElementById('searchResults');
    var stats = document.getElementById('searchStats');

    if (!container || !stats || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    stats.textContent = '找到 ' + results.length + ' 部相关影片。';

    container.innerHTML = results.slice(0, 120).map(function (movie) {
      return [
        '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '">',
        '  <a class="poster-wrap" href="' + escapeHtml(movie.url) + '" data-title="' + escapeHtml(movie.title) + '">',
        '    <img class="poster-image" src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-badge">' + escapeHtml(movie.score) + '</span>',
        '    <span class="play-chip">播放</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
        '    <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function runGlobalSearch() {
    if (!window.MOVIE_SEARCH_DATA) {
      return;
    }

    var input = document.getElementById('globalSearchInput');
    var query = normalize(input ? input.value : '');
    var results = window.MOVIE_SEARCH_DATA.filter(function (movie) {
      if (!query) {
        return true;
      }

      return normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.tags
      ].join(' ')).indexOf(query) !== -1;
    });

    renderSearchResults(results);
  }

  var searchButton = document.getElementById('globalSearchButton');
  var searchInput = document.getElementById('globalSearchInput');

  if (searchInput && window.MOVIE_SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;
    searchInput.addEventListener('input', runGlobalSearch);
    runGlobalSearch();
  }

  if (searchButton) {
    searchButton.addEventListener('click', runGlobalSearch);
  }
})();
