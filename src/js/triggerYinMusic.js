module.exports = function(state) {
  if (state === 1) return;

  var track = util.id("bonus-bgm").textTracks[0];
  var bgm = util.id("bonus-bgm");
  var subtitles = util.id("subtitles");

  if (!track.oncuechange) {
    track.mode = "hidden";
    track.oncuechange = function(e) {
      if (this.activeCues.length === 0) return;

      var text =
        "<div class='jpn'>" +
        this.activeCues[0].getCueAsHTML().textContent.replace("*", "</div><div class='eng'>") +
        "</div>";

      fastdom.mutate(function() {
        subtitles.innerHTML = text;
      });
    };
  }

  if (!bgm.paused) {
    bgm.pause();
    return;
  }

  if (subtitles.innerHTML === "" && bgm.readyState !== 4) {
    fastdom.mutate(function() {
      subtitles.innerHTML = "<div class='eng'>Loading Audio...</div>";
    });
  }

  bgm.volume = 0.75;
  bgm.play();
};
