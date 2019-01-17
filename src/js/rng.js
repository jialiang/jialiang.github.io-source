module.exports = function() {
  var s = 0;
  var t = 0;
  var n = 0;
  var lastCoords = { x: 0, y: 0 };
  var lock = false;
  var img = util.id("neko");
  var ignore = false;

  img.addEventListener(
    "touchmove",
    function(event) {
      event.preventDefault();
      event.stopPropagation();

      rng(event.touches[0].clientX, event.touches[0].clientY);

      ignore = true;
    },
    { passive: false }
  );

  img.addEventListener(
    "mousemove",
    function(event) {
      event.preventDefault();
      event.stopPropagation();

      if (!ignore) rng(event.clientX, event.clientY);

      ignore = false;
    },
    { passive: false }
  );

  function rng(x, y) {
    if (lock || (x === lastCoords.x && y === lastCoords.y)) return;

    lock = true;

    var newCoords = { x: x, y: y };

    var angle =
      lastCoords.x === lastCoords.y
        ? Math.PI / 2
        : Math.atan(Math.abs(lastCoords.y - newCoords.y) / Math.abs(lastCoords.x - newCoords.x));
    var real =
      (angle / (Math.PI / 2) +
        parseInt(
          Date.now()
            .toString()
            .slice(-8),
          10
        ) /
          1e8) %
      1;

    var real_bin = (real % 1).toString(2).substring(2);

    while (real_bin.length < 52) {
      real_bin += "0";
    }

    var m = real;
    var mPrime = real_bin
      .split("")
      .reverse()
      .reduceRight(function(r, a) {
        return (r + parseInt(a, 2)) / 2;
      }, 0);

    var g = tentMap((s + m) % 1, (t + mPrime) % 1);

    var x = (mPrime + g) % 1;

    var s2 = tentMap(Math.min(x, t), Math.max(x, t));
    var t2 = (s + g) % 1;

    n++;

    s = s2;
    t = t2;
    lastCoords = newCoords;

    if (n % 128 === 0) {
      var draw_transition = util.id("draw-transition");
      var num = Math.floor(((s + t) % 1) * 10);

      draw_transition.className = "active-1";
      util.id("tarot").textContent = num;

      setTimeout(function() {
        util.id("number-history").textContent += "[" + num + "] ";
      }, 1000);

      setTimeout(function() {
        draw_transition.className = "";
        lock = false;
      }, 3000);
    } else {
      lock = false;
    }
  }

  function tentMap(a, x) {
    if (0 < x && x <= a) {
      return x / a;
    } else if (a < x && x < 1) {
      return (1 - x) / (1 - a);
    } else {
      console.warn("Error computing g.");
      return 0;
    }
  }
};
