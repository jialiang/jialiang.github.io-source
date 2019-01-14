module.exports = function() {
  var hovering = false;

  var frameTextOverlay = util.id("frame-text-overlay");
  var koishiWalk = util.id("koishi-walk-container");
  var catWalk = util.id("cat-walk-container");
  var yinWalk = util.id("yin-walk-container");
  var shadow = util.id("shadow");

  var a = util.qa("#mainmenu>nav>ul>li>a");

  for (var i = 0; i < a.length; i++) {
    a[i].onmouseover = function(e) {
      hovering = true;

      fastdom.mutate(function() {
        frameTextOverlay.style.backgroundImage =
          "url(\"data:image/svg+xml,%3Csvg width='" +
          (e.target.textContent.length * 10 + 20) +
          "' height='30' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='90' height='30' fill='orange'%3E%3C/rect%3E%3Ctext x='5' y='20' fill='white' font-weight='bold' font-size='15px' font-family='Verdana, sans-serif'%3E" +
          e.target.textContent.toUpperCase() +
          '%3C/text%3E%3C/svg%3E")';
        frameTextOverlay.style.transform = "scale(1)";
        frameTextOverlay.style.webkitTransform = "scaleX(1)";
        frameTextOverlay.style.opacity = "1";

        catWalk.style.opacity = "0";
        koishiWalk.style.opacity = "0";
        yinWalk.style.opacity = "0";
        shadow.style.opacity = "0";
      });
    };

    a[i].onmouseout = function(e) {
      hovering = false;

      setTimeout(function() {
        if (hovering) return;

        fastdom.mutate(function() {
          frameTextOverlay.style.transform = "";
          frameTextOverlay.style.webkitTransform = "";
          frameTextOverlay.style.opacity = "";

          catWalk.style.opacity = "";
          koishiWalk.style.opacity = "";
          yinWalk.style.opacity = "";
          shadow.style.opacity = "";
        });
      }, 250);
    };
  }
};