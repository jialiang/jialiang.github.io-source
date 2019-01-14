module.exports = function koishiFloatTrigger(state) {
    if (state === 1) return;

    var ktc = util.id("koishi-text-container");
    var ntc = util.q("#about>.text-container");

    fastdom.mutate(function() {
      if (ktc.style.opacity === "") {
        ktc.style.opacity = "1";
        ktc.style.pointerEvents = "auto";
        ntc.style.height = "100%";
      } else {
        ktc.style.opacity = "";
        ktc.style.pointerEvents = "";
        ntc.style.height = "";
      }
    });
  }