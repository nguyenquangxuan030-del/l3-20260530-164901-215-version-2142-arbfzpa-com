(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuToggle = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuToggle && mobilePanel) {
      menuToggle.addEventListener("click", function () {
        var isOpen = mobilePanel.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var previous = hero.querySelector(".hero-control.prev");
      var next = hero.querySelector(".hero-control.next");
      var index = 0;
      var timer = null;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      function schedule() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5000);
      }

      if (previous) {
        previous.addEventListener("click", function () {
          showSlide(index - 1);
          schedule();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(index + 1);
          schedule();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
          schedule();
        });
      });

      showSlide(0);
      schedule();
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var filterForm = document.querySelector("[data-filter-form]");
    var filterGrid = document.querySelector("[data-filter-grid]");

    if (filterForm && filterGrid) {
      var keywordInput = filterForm.querySelector("[data-filter-keyword]");
      var regionSelect = filterForm.querySelector("[data-filter-region]");
      var yearSelect = filterForm.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(filterGrid.querySelectorAll(".movie-card"));

      if (keywordInput && query) {
        keywordInput.value = query;
      }

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilter() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var region = normalize(regionSelect && regionSelect.value);
        var year = normalize(yearSelect && yearSelect.value);

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-category")
          ].join(" "));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedRegion = !region || cardRegion === region;
          var matchedYear = !year || cardYear === year;

          card.classList.toggle("hidden-card", !(matchedKeyword && matchedRegion && matchedYear));
        });
      }

      filterForm.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter();
      });

      [keywordInput, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    }
  });
})();
