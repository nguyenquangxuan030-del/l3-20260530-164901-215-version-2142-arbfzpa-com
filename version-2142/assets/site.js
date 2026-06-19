import { H as Hls } from './hls.js';

const SELECTORS = {
    menuToggle: '[data-menu-toggle]',
    mobilePanel: '[data-mobile-panel]',
    hero: '[data-hero-carousel]',
    player: '.js-player',
    filterScope: '[data-filter-scope]'
};

function setupMenu() {
    const toggle = document.querySelector(SELECTORS.menuToggle);
    const panel = document.querySelector(SELECTORS.mobilePanel);

    if (!toggle || !panel) {
        return;
    }

    toggle.addEventListener('click', () => {
        panel.classList.toggle('is-open');
    });
}

function setupHeroCarousel() {
    const root = document.querySelector(SELECTORS.hero);

    if (!root) {
        return;
    }

    const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(root.querySelectorAll('[data-hero-dot]'));
    const previousButton = root.querySelector('[data-hero-prev]');
    const nextButton = root.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(() => show(current + 1), 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
        }
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            show(index);
            start();
        });
    });

    previousButton?.addEventListener('click', () => {
        show(current - 1);
        start();
    });

    nextButton?.addEventListener('click', () => {
        show(current + 1);
        start();
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
}

function setupSearchForms() {
    const forms = document.querySelectorAll('.js-search-form');

    forms.forEach((form) => {
        form.addEventListener('submit', (event) => {
            const input = form.querySelector('input[type="search"]');
            const query = input ? input.value.trim() : '';

            if (!query && form.matches('.hero-search')) {
                event.preventDefault();
                window.location.href = form.getAttribute('action') || 'library.html';
            }
        });
    });
}

function setupFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q') || '';

    document.querySelectorAll(SELECTORS.filterScope).forEach((scope) => {
        const input = scope.querySelector('.js-card-search');
        const region = scope.querySelector('.js-filter-region');
        const type = scope.querySelector('.js-filter-type');
        const year = scope.querySelector('.js-filter-year');
        const category = scope.querySelector('.js-filter-category');
        const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
        const count = scope.querySelector('.js-result-count');
        const empty = scope.querySelector('[data-empty-state]');

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function applyFilters() {
            const query = (input?.value || '').trim().toLowerCase();
            const regionValue = region?.value || '';
            const typeValue = type?.value || '';
            const yearValue = year?.value || '';
            const categoryValue = category?.value || '';
            let visible = 0;

            cards.forEach((card) => {
                const text = (card.dataset.search || '').toLowerCase();
                const matchesQuery = !query || text.includes(query);
                const matchesRegion = !regionValue || card.dataset.region === regionValue;
                const matchesType = !typeValue || card.dataset.type === typeValue;
                const matchesYear = !yearValue || card.dataset.year === yearValue;
                const matchesCategory = !categoryValue || card.dataset.category === categoryValue;
                const show = matchesQuery && matchesRegion && matchesType && matchesYear && matchesCategory;

                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, region, type, year, category].forEach((control) => {
            control?.addEventListener('input', applyFilters);
            control?.addEventListener('change', applyFilters);
        });

        applyFilters();
    });
}

function setupPlayers() {
    document.querySelectorAll(SELECTORS.player).forEach((frame) => {
        const video = frame.querySelector('video');
        const button = frame.querySelector('.player-overlay');
        const message = frame.querySelector('.player-message');
        const source = frame.dataset.src;
        let initialized = false;
        let hls = null;

        if (!video || !button || !source) {
            return;
        }

        function setMessage(text) {
            if (message) {
                message.textContent = text;
            }
        }

        function initializePlayer() {
            if (initialized) {
                video.play().catch(() => setMessage('浏览器阻止了自动播放，请再次点击播放按钮。'));
                return;
            }

            initialized = true;
            button.classList.add('is-hidden');
            setMessage('正在加载高清播放源…');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', () => {
                    setMessage('');
                    video.play().catch(() => setMessage('请点击播放器继续播放。'));
                }, { once: true });
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
                    setMessage('');
                    video.play().catch(() => setMessage('请点击播放器继续播放。'));
                });
                hls.on(Hls.Events.ERROR, (_event, data) => {
                    if (data?.fatal) {
                        setMessage('播放源加载失败，请刷新页面或稍后重试。');
                    }
                });
                return;
            }

            video.src = source;
            setMessage('当前浏览器可能不支持 HLS 播放，请换用 Chrome、Safari 或 Edge。');
        }

        button.addEventListener('click', initializePlayer);
        video.addEventListener('play', () => button.classList.add('is-hidden'));
        video.addEventListener('pause', () => {
            if (!video.ended) {
                button.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
}

setupMenu();
setupHeroCarousel();
setupSearchForms();
setupFilters();
setupPlayers();
