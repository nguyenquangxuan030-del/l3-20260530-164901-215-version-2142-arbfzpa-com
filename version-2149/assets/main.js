const menuButton = document.querySelector(".menu-toggle");
const mobilePanel = document.querySelector(".mobile-panel");

if (menuButton && mobilePanel) {
  menuButton.addEventListener("click", () => {
    const isOpen = mobilePanel.hasAttribute("hidden");
    if (isOpen) {
      mobilePanel.removeAttribute("hidden");
      menuButton.setAttribute("aria-expanded", "true");
    } else {
      mobilePanel.setAttribute("hidden", "hidden");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
const heroDots = Array.from(document.querySelectorAll(".hero-dot"));
const heroPrev = document.querySelector(".hero-prev");
const heroNext = document.querySelector(".hero-next");
let activeSlide = 0;
let heroTimer = null;

function showSlide(index) {
  if (!heroSlides.length) {
    return;
  }

  activeSlide = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, itemIndex) => {
    slide.classList.toggle("is-active", itemIndex === activeSlide);
  });
  heroDots.forEach((dot, itemIndex) => {
    dot.classList.toggle("is-active", itemIndex === activeSlide);
  });
}

function queueHero() {
  if (heroTimer) {
    window.clearInterval(heroTimer);
  }

  if (heroSlides.length > 1) {
    heroTimer = window.setInterval(() => showSlide(activeSlide + 1), 5000);
  }
}

if (heroSlides.length) {
  showSlide(0);
  queueHero();

  heroPrev?.addEventListener("click", () => {
    showSlide(activeSlide - 1);
    queueHero();
  });

  heroNext?.addEventListener("click", () => {
    showSlide(activeSlide + 1);
    queueHero();
  });

  heroDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.slideTarget || 0));
      queueHero();
    });
  });
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

const filterPanel = document.querySelector(".filter-panel");
const filterGrid = document.querySelector(".filter-grid");

if (filterPanel && filterGrid) {
  const keywordInput = filterPanel.querySelector('[data-filter="keyword"]');
  const typeSelect = filterPanel.querySelector('[data-filter="type"]');
  const regionSelect = filterPanel.querySelector('[data-filter="region"]');
  const yearSelect = filterPanel.querySelector('[data-filter="year"]');
  const cards = Array.from(filterGrid.querySelectorAll(".movie-card"));
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");

  if (query && keywordInput) {
    keywordInput.value = query;
  }

  function applyFilters() {
    const keyword = normalizeText(keywordInput?.value);
    const type = normalizeText(typeSelect?.value);
    const region = normalizeText(regionSelect?.value);
    const year = normalizeText(yearSelect?.value);

    cards.forEach((card) => {
      const haystack = normalizeText([
        card.dataset.title,
        card.dataset.tags,
        card.textContent
      ].join(" "));
      const matchesKeyword = !keyword || haystack.includes(keyword);
      const matchesType = !type || normalizeText(card.dataset.type) === type;
      const matchesRegion = !region || normalizeText(card.dataset.region) === region;
      const matchesYear = !year || normalizeText(card.dataset.year) === year;
      card.hidden = !(matchesKeyword && matchesType && matchesRegion && matchesYear);
    });
  }

  filterPanel.addEventListener("input", applyFilters);
  filterPanel.addEventListener("change", applyFilters);
  applyFilters();
}
