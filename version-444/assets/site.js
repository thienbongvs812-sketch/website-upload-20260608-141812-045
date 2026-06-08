function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

ready(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-mobile-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function applyFilter(input) {
    var form = input.closest("form");
    var scope = form && form.hasAttribute("data-local-filter") ? document : document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var term = input.value.trim().toLowerCase();
    cards.forEach(function (card) {
      var text = (
        card.getAttribute("data-title") + " " +
        card.getAttribute("data-meta") + " " +
        card.textContent
      ).toLowerCase();
      card.classList.toggle("is-hidden", term !== "" && text.indexOf(term) === -1);
    });
  }

  var searchParams = new URLSearchParams(window.location.search);
  var query = searchParams.get("q") || "";
  var searchInput = document.querySelector("[data-search-page-form] [data-filter-input]");
  if (searchInput) {
    searchInput.value = query;
    applyFilter(searchInput);
    searchInput.addEventListener("input", function () {
      applyFilter(searchInput);
    });
    var searchForm = searchInput.closest("form");
    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter(searchInput);
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-local-filter] [data-filter-input]")).forEach(function (input) {
    input.addEventListener("input", function () {
      applyFilter(input);
    });
  });

  function loadStream(video, stream, wrap) {
    if (!video || !stream) {
      return;
    }
    if (wrap) {
      wrap.classList.add("is-playing");
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.src) {
        video.src = stream;
      }
      video.play().catch(function () {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsReady) {
        var hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hlsReady = true;
      }
      video.play().catch(function () {});
      return;
    }
    if (!video.src) {
      video.src = stream;
    }
    video.play().catch(function () {});
  }

  Array.prototype.slice.call(document.querySelectorAll(".player-wrap")).forEach(function (wrap) {
    var video = wrap.querySelector("video[data-stream]");
    var button = wrap.querySelector("[data-player-button]");
    var stream = video ? video.getAttribute("data-stream") : "";
    if (button && video) {
      button.addEventListener("click", function () {
        loadStream(video, stream, wrap);
      });
    }
    if (video) {
      video.addEventListener("play", function () {
        wrap.classList.add("is-playing");
      });
    }
  });
});
