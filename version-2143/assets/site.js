(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            mobileNav.hidden = expanded;
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === currentSlide);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    function startHeroTimer() {
        if (!slides.length) {
            return;
        }
        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5600);
    }

    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(currentSlide - 1);
            startHeroTimer();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(currentSlide + 1);
            startHeroTimer();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-target-slide') || 0));
            startHeroTimer();
        });
    });

    startHeroTimer();

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q');
    var searchInput = document.querySelector('.site-search');

    if (searchInput && queryFromUrl) {
        searchInput.value = queryFromUrl;
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var query = normalize(searchInput ? searchInput.value : '');
        var yearSelect = document.querySelector('.year-filter');
        var regionSelect = document.querySelector('.region-filter');
        var year = yearSelect ? yearSelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' '));
            var matchesQuery = !query || haystack.indexOf(query) !== -1;
            var matchesYear = !year || card.getAttribute('data-year') === year;
            var matchesRegion = !region || card.getAttribute('data-region') === region;
            var show = matchesQuery && matchesYear && matchesRegion;
            card.hidden = !show;
            if (show) {
                visible += 1;
            }
        });

        var empty = document.querySelector('.empty-state');
        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    ['input', 'change'].forEach(function (eventName) {
        document.addEventListener(eventName, function (event) {
            if (event.target.matches('.site-search, .year-filter, .region-filter')) {
                applyFilters();
            }
        });
    });

    if (searchInput && queryFromUrl) {
        applyFilters();
    }

    function playShell(shell) {
        var video = shell.querySelector('video');
        var url = shell.getAttribute('data-video-url');
        if (!video || !url) {
            return;
        }

        shell.classList.add('is-playing');

        if (window.Hls && window.Hls.isSupported()) {
            if (!video._hlsInstance) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                video._hlsInstance = hls;
            }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.src) {
                video.src = url;
            }
        } else if (!video.src) {
            video.src = url;
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                video.controls = true;
            });
        }
    }

    document.querySelectorAll('.video-shell').forEach(function (shell) {
        var overlay = shell.querySelector('.video-overlay');
        if (overlay) {
            overlay.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                playShell(shell);
            });
        }
        shell.addEventListener('click', function (event) {
            if (event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
                return;
            }
            if (!shell.classList.contains('is-playing')) {
                playShell(shell);
            }
        });
    });
})();
