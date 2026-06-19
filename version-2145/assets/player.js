(function () {
  function loadHelper() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve();
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function attachStream(video, stream) {
    if (!stream) {
      return Promise.reject(new Error('stream'));
    }

    if (video.dataset.ready === '1') {
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.dataset.ready = '1';
      return Promise.resolve();
    }

    return loadHelper().then(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.dataset.ready = '1';
        return;
      }
      video.src = stream;
      video.dataset.ready = '1';
    });
  }

  document.querySelectorAll('[data-player-shell]').forEach(function (shell) {
    var video = shell.querySelector('video[data-stream]');
    var start = shell.querySelector('[data-player-start]');

    if (!video || !start) {
      return;
    }

    function begin() {
      attachStream(video, video.getAttribute('data-stream'))
        .then(function () {
          shell.classList.add('is-playing');
          return video.play();
        })
        .catch(function () {
          shell.classList.remove('is-playing');
        });
    }

    start.addEventListener('click', begin);
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
  });
})();
