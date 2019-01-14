var Game = require("./touhou");

module.exports = function() {
  util.q("#game-controls > .play").onclick = function() {
    game = new Game();

    fastdom.mutate(function() {
      util.id("game-controls").style.visibility = "hidden";
    });
  };

  util.q("#game-controls > .audio").onclick = function() {
    util.id("game-music").pause();
    gameAudio = !gameAudio;

    fastdom.mutate(function() {
      util.q("#game-controls > .audio").textContent = "Audio: " + (gameAudio ? "ON" : "OFF");
    });
  };
};
