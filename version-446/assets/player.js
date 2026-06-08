(function () {
  function playVideo(video) {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  document.querySelectorAll("[data-player]").forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play]");
    var stream = player.getAttribute("data-stream");
    var ready = false;
    var hls = null;

    function attachStream() {
      if (ready || !video || !stream) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (player.classList.contains("is-playing")) {
              playVideo(video);
            }
          });
        }
      } else {
        video.src = stream;
      }
    }

    function start() {
      attachStream();
      player.classList.add("is-playing");
      video.controls = true;
      playVideo(video);
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  });
})();
