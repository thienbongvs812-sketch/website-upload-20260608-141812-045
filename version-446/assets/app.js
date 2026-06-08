(function () {
  function qsAll(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }

  qsAll(document, "[data-menu-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      var nav = document.querySelector("[data-mobile-nav]");
      if (nav) {
        nav.classList.toggle("is-open");
      }
    });
  });

  qsAll(document, "[data-hero-carousel]").forEach(function (carousel) {
    var slides = qsAll(carousel, "[data-hero-slide]");
    var dots = qsAll(carousel, "[data-hero-dot]");
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function setSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        setSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        setSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });

    setSlide(0);
    startTimer();
  });

  qsAll(document, "[data-filter-panel]").forEach(function (panel) {
    var section = panel.closest("section") || document;
    var cards = qsAll(section, ".movie-card");
    var input = panel.querySelector("[data-filter-input]");
    var year = panel.querySelector("[data-year-filter]");
    var type = panel.querySelector("[data-type-filter]");
    var empty = section.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q") || "";

    if (input && queryValue) {
      input.value = queryValue;
    }

    function applyFilter() {
      var words = (input && input.value ? input.value : "").trim().toLowerCase();
      var yearValue = year && year.value ? year.value : "";
      var typeValue = type && type.value ? type.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region")
        ].join(" ").toLowerCase();
        var matchWords = !words || haystack.indexOf(words) !== -1;
        var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var matchType = !typeValue || card.getAttribute("data-type") === typeValue;
        var show = matchWords && matchYear && matchType;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, year, type].forEach(function (node) {
      if (node) {
        node.addEventListener("input", applyFilter);
        node.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  });
})();
