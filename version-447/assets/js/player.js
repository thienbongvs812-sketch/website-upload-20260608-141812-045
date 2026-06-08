import { H as Hls } from "./hls.js";

export function mountPlayer(source, poster) {
  const shell = document.querySelector("[data-player]");

  if (!shell) {
    return;
  }

  const video = shell.querySelector("video");
  const overlay = shell.querySelector("[data-play]");
  let hls = null;
  let loaded = false;
  let loading = false;

  if (poster) {
    video.poster = poster;
  }

  const showError = () => {
    overlay.classList.remove("is-hidden");
    overlay.innerHTML =
      '<span class="play-ring">▶</span><strong>重新播放</strong>';
    loading = false;
  };

  const loadStream = () => {
    if (loaded || loading) {
      return Promise.resolve();
    }

    loading = true;

    return new Promise((resolve, reject) => {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener(
          "loadedmetadata",
          () => {
            loaded = true;
            loading = false;
            resolve();
          },
          { once: true },
        );
        video.addEventListener(
          "error",
          () => {
            loading = false;
            reject(new Error("load"));
          },
          { once: true },
        );
        video.load();
        return;
      }

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          loaded = true;
          loading = false;
          resolve();
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            loading = false;
            reject(new Error("load"));
          }
        });
        return;
      }

      loading = false;
      reject(new Error("support"));
    });
  };

  const play = async () => {
    try {
      overlay.classList.add("is-hidden");
      await loadStream();
      await video.play();
    } catch (error) {
      showError();
    }
  };

  overlay.addEventListener("click", play);

  video.addEventListener("play", () => {
    overlay.classList.add("is-hidden");
  });

  video.addEventListener("ended", () => {
    overlay.classList.remove("is-hidden");
  });

  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
    }
  });
}
