(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move(1);
        restart();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    show(0);
    restart();
  });

  document.querySelectorAll('[data-catalog-controls]').forEach(function (controls) {
    var input = controls.querySelector('[data-catalog-search]');
    var buttons = Array.prototype.slice.call(controls.querySelectorAll('[data-filter-year]'));
    var catalog = controls.parentElement.querySelector('[data-catalog]');
    var empty = controls.parentElement.querySelector('[data-no-results]');
    var activeYear = 'all';

    if (!catalog) {
      return;
    }

    var cards = Array.prototype.slice.call(catalog.querySelectorAll('[data-card]'));

    function applyFilters() {
      var value = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-title') || '').toLowerCase();
        var year = card.getAttribute('data-year') || '';
        var matchText = !value || haystack.indexOf(value) !== -1;
        var matchYear = activeYear === 'all' || year === activeYear;
        var shouldShow = matchText && matchYear;

        card.style.display = shouldShow ? '' : 'none';

        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.getAttribute('data-filter-year') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilters();
      });
    });
  });
}());

function loadHlsRuntime(callback) {
  if (window.Hls) {
    callback();
    return;
  }

  var existing = document.querySelector('script[data-hls-runtime]');

  if (existing) {
    existing.addEventListener('load', callback, { once: true });
    return;
  }

  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
  script.async = true;
  script.setAttribute('data-hls-runtime', 'true');
  script.addEventListener('load', callback, { once: true });
  document.head.appendChild(script);
}

function initializeMoviePlayer(videoId, streamUrl, overlayId) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var hasAttached = false;
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function attach() {
    if (hasAttached) {
      return;
    }

    hasAttached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    loadHlsRuntime(function () {
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    });
  }

  function start() {
    attach();

    if (overlay) {
      overlay.classList.add('hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
