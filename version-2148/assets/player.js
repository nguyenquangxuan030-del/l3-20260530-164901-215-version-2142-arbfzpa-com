(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".player-start");
      var stream = video ? video.getAttribute("data-stream") : "";
      var attached = false;
      var hlsInstance = null;

      function attachStream() {
        if (!video || !stream || attached) {
          return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function startPlayback() {
        if (!video) {
          return;
        }

        attachStream();
        shell.classList.add("has-loaded");
        var playTask = video.play();

        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function () {
            shell.classList.remove("has-loaded");
          });
        }
      }

      if (button) {
        button.addEventListener("click", startPlayback);
      }

      if (video) {
        video.addEventListener("play", function () {
          shell.classList.add("has-loaded");
        });

        video.addEventListener("loadedmetadata", function () {
          shell.classList.add("has-loaded");
        });

        window.addEventListener("beforeunload", function () {
          if (hlsInstance && typeof hlsInstance.destroy === "function") {
            hlsInstance.destroy();
          }
        });
      }
    });
  });
})();
