function markImageMissing(image) {
    var holder = image.closest('.poster-wrap') || image.closest('.ranking-cover') || image.closest('.hero-bg');
    if (holder) {
        holder.classList.add('no-image');
    }
}

function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
}

function initMenu() {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.menu-toggle');
    if (!header || !toggle) {
        return;
    }
    toggle.addEventListener('click', function () {
        header.classList.toggle('open');
    });
}

function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
        return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            show(Number(dot.getAttribute('data-hero-dot')) || 0);
            start();
        });
    });

    if (prev) {
        prev.addEventListener('click', function () {
            show(current - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            show(current + 1);
            start();
        });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
}

function initFilters() {
    var input = document.querySelector('[data-filter-input]');
    var year = document.querySelector('[data-year-filter]');
    var list = document.querySelector('[data-filter-list]');
    var result = document.querySelector('[data-filter-result]');

    if (!list) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && input) {
        input.value = query;
    }

    var items = Array.prototype.slice.call(list.children);

    function apply() {
        var keyword = normalizeText(input ? input.value : '');
        var selectedYear = year ? year.value : '';
        var visible = 0;

        items.forEach(function (item) {
            var haystack = normalizeText([
                item.getAttribute('data-title'),
                item.getAttribute('data-genre'),
                item.getAttribute('data-region'),
                item.getAttribute('data-year'),
                item.getAttribute('data-tags')
            ].join(' '));
            var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchYear = !selectedYear || normalizeText(item.getAttribute('data-year')).indexOf(selectedYear) !== -1;
            var show = matchKeyword && matchYear;
            item.classList.toggle('hidden-card', !show);
            if (show) {
                visible += 1;
            }
        });

        if (result) {
            result.textContent = keyword || selectedYear ? '找到 ' + visible + ' 部影片' : '';
        }
    }

    if (input) {
        input.addEventListener('input', apply);
    }
    if (year) {
        year.addEventListener('change', apply);
    }
    apply();
}

function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        if (!video || !button) {
            return;
        }

        var hlsSource = video.getAttribute('data-source');
        var fallbackSource = video.getAttribute('data-fallback');
        var nativeHls = video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');

        if (nativeHls && hlsSource) {
            video.src = hlsSource;
        } else if (fallbackSource) {
            video.src = fallbackSource;
        } else if (hlsSource) {
            video.src = hlsSource;
        }

        function play() {
            var promise = video.play();
            if (promise && typeof promise.then === 'function') {
                promise.then(function () {
                    player.classList.add('playing');
                }).catch(function () {
                    player.classList.remove('playing');
                });
            } else {
                player.classList.add('playing');
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('play', function () {
            player.classList.add('playing');
        });
        video.addEventListener('pause', function () {
            player.classList.remove('playing');
        });
        video.addEventListener('ended', function () {
            player.classList.remove('playing');
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
});
