(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

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

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('.filter-panel').forEach(function (panel) {
    var target = document.querySelector(panel.getAttribute('data-target'));
    if (!target) {
      return;
    }

    var cards = Array.prototype.slice.call(target.querySelectorAll('.search-card'));
    var controls = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
    var reset = panel.querySelector('[data-filter-reset]');
    var noResults = document.querySelector('[data-no-results]');

    function value(name) {
      var control = panel.querySelector('[data-filter="' + name + '"]');
      return control ? control.value.trim().toLowerCase() : '';
    }

    function apply() {
      var keyword = value('keyword');
      var year = value('year');
      var type = value('type');
      var category = value('category');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
        var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (category && cardCategory !== category) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.hidden = visible !== 0;
      }
    }

    controls.forEach(function (control) {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });

    if (reset) {
      reset.addEventListener('click', function () {
        controls.forEach(function (control) {
          control.value = '';
        });
        apply();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    var keywordControl = panel.querySelector('[data-filter="keyword"]');
    if (query && keywordControl) {
      keywordControl.value = query;
    }

    apply();
  });
})();

function initMoviePlayer(sourceUrl) {
  var video = document.getElementById('moviePlayer');
  var cover = document.getElementById('playerCover');
  var hls = null;
  var ready = false;

  if (!video || !sourceUrl) {
    return;
  }

  function attach() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      return;
    }

    video.src = sourceUrl;
  }

  function start() {
    attach();
    video.controls = true;
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      start();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
