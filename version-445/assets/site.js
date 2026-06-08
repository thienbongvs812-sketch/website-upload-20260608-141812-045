(function () {
  var toggle = document.querySelector('[data-mobile-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var heroSlider = document.querySelector('[data-hero-slider]');

  if (heroSlider) {
    var slides = Array.prototype.slice.call(heroSlider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentIndex = 0;

    function showSlide(index) {
      currentIndex = index % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === currentIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5200);
    }
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var searchInput = filterPanel.querySelector('[data-filter-search]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var resetButton = filterPanel.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);

    if (params.get('q') && searchInput) {
      searchInput.value = params.get('q');
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
      var keyword = normalize(searchInput && searchInput.value);
      var typeValue = normalize(typeSelect && typeSelect.value);
      var yearValue = normalize(yearSelect && yearSelect.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.type
        ].join(' '));

        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (typeValue && normalize(card.dataset.type).indexOf(typeValue) === -1) {
          matched = false;
        }

        if (yearValue && normalize(card.dataset.year) !== yearValue) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.style.display = visibleCount ? 'none' : 'block';
      }
    }

    [searchInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }

        if (typeSelect) {
          typeSelect.value = '';
        }

        if (yearSelect) {
          yearSelect.value = '';
        }

        filterCards();
      });
    }

    filterCards();
  }
})();
