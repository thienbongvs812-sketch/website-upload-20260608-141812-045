(function () {
  var players = document.querySelectorAll('[data-hls-player]');

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-overlay]');
    var source = player.getAttribute('data-video-src');
    var isReady = false;

    function attachSource() {
      if (!video || !source || isReady) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }

      isReady = true;
    }

    function startPlayback() {
      attachSource();

      var playPromise = video.play();

      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        }).catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      } else if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        } else {
          video.pause();
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        }
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (video && video._hlsInstance) {
        video._hlsInstance.destroy();
      }
    });
  });
})();
