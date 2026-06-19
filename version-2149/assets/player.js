const Hls = window.Hls;
const playerBoxes = Array.from(document.querySelectorAll(".movie-player-box"));

playerBoxes.forEach((box) => {
  const video = box.querySelector("video");
  const overlay = box.querySelector(".player-overlay");
  const videoUrl = box.dataset.video;
  let hls = null;

  if (!video || !overlay || !videoUrl) {
    return;
  }

  function attachVideo() {
    if (video.dataset.ready === "true") {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
    } else {
      video.src = videoUrl;
    }

    video.dataset.ready = "true";
  }

  function playVideo() {
    attachVideo();
    overlay.classList.add("is-hidden");
    video.setAttribute("controls", "controls");
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", playVideo);
  video.addEventListener("click", () => {
    if (!video.dataset.ready || video.paused) {
      playVideo();
    }
  });

  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
});
