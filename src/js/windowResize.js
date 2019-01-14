var Particles = require("./particles");

module.exports = function() {
  var resizing = 0;
  var startPaused = null;

  window.onresize = function() {
    resizing++;

    if (startPaused === null) startPaused = particles.isPaused();

    setTimeout(function() {
      resizing--;

      if (resizing === 0) {
        fastdom.mutate(function() {
          windowHeight = window.innerHeight;
          windowWidth = window.innerWidth;

          particles.pause();
          particles = new Particles(startPaused);

          startPaused = null;
        });
      }
    }, 150);
  };
};
