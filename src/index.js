var r = require.context("./css/", true, /\.css$/);

r.keys().forEach(r);

require("./js/global");

var Particles = require("./js/particles");
var navHover = require("./js/navHover");

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", DOMContentLoaded)
  : DOMContentLoaded();

function DOMContentLoaded() {
  if (window.location.hash.substring(1).match(NOT_MAINMENU)) {
    document.body.className += " skip-start-animation";
    navHover();
  } else {
    setTimeout(navHover, 1500);
  }

  fastdom.mutate(function() {
    document.body.className = document.body.className.replace("no-transition", "");
  });

  particles = new Particles();

  util.registerFastClick(util.id("cat-walk"), require("./js/themeChange"));
  util.registerFastClick(util.id("yin-walk-body"), require("./js/triggerYinMusic"));
  util.registerFastClick(util.id("koishi-float"), require("./js/koishiFloatTrigger"));

  var a = util.qa("nav>ul>li>a, .back, .internal-link");

  for (var i = 0; i < a.length; i++) {
    util.registerFastClick(a[i], function(state, elem) {
      window.location = elem.href;
    });
  }

  require("./js/guestbook")();
  require("./js/registerGameControls")();
  require("./js/rng")();
  require("./js/windowResize")();
}
