(function () {
  function select(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function bindMenu() {
    var button = select('.menu-button');
    var panel = select('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
      button.textContent = panel.classList.contains('open') ? '×' : '☰';
    });
  }

  function bindHero() {
    var hero = select('.hero-carousel');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var minis = selectAll('.hero-mini-card', hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('active', pos === current);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('active', pos === current);
      });
      minis.forEach(function (mini, pos) {
        mini.classList.toggle('active', pos === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-target')) || 0);
        start();
      });
    });

    minis.forEach(function (mini) {
      mini.addEventListener('mouseenter', function () {
        show(Number(mini.getAttribute('data-target')) || 0);
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function bindSearchPage() {
    var input = select('#search-page-input');
    var results = select('#search-results');
    if (!input || !results) {
      return;
    }
    var cards = selectAll('.movie-card', results);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function filterCards() {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' ').toLowerCase();
        card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
      });
    }

    input.addEventListener('input', filterCards);
    filterCards();
  }

  function bindPlayer() {
    var video = select('.player-video');
    if (!video) {
      return;
    }
    var url = video.getAttribute('data-url');
    var playButton = select('.player-start');
    var hlsInstance = null;

    function setup() {
      if (!url || video.getAttribute('data-ready') === '1') {
        return;
      }
      video.setAttribute('data-ready', '1');
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else {
        video.src = url;
      }
    }

    setup();

    if (playButton) {
      playButton.addEventListener('click', function () {
        setup();
        var playPromise = video.play();
        playButton.classList.add('hidden');
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            playButton.classList.remove('hidden');
          });
        }
      });
    }

    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindMenu();
    bindHero();
    bindSearchPage();
    bindPlayer();
  });
}());
