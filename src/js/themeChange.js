module.exports = function(state) {
  if (state === 1) return;

  var mainmenu = util.id("mainmenu");
  var koishiFloat = util.id("koishi-float-container");

  if (mainmenu.className === "show-ori-theme") {
    fastdom.mutate(function() {
      mainmenu.className = "show-alt-theme";
      koishiFloat.style.opacity = "0";
    });

    particles.pause();
  } else {
    fastdom.mutate(function() {
      mainmenu.className = "show-ori-theme";
      koishiFloat.style.opacity = "";
    });

    particles.play();
  }
};
