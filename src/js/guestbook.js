module.exports = function() {
  function submitGuestbook() {
    var message = util.id("message");

    fastdom.mutate(function() {
      message.textContent = "Submiting entry...";
    });

    util.postAjax(
      "https://guestbook-1.herokuapp.com/entries",
      "POST",
      {
        name: util.q("input[name='name']").value || "",
        message: util.q("input[name='message']").value || "",
        website: util.q("input[name='website']").value || ""
      },
      function(status, response) {
        if (!response) {
          fastdom.mutate(function() {
            message.textContent = "No response from server.";
          });
          return;
        }

        fastdom.mutate(function() {
          message.textContent = response.message;
        });

        if (status === 200) populateGuestbook(0, true);
      }
    );
  }

  function deleteGuestbook() {
    var message = util.id("message");

    fastdom.mutate(function() {
      message.textContent = "Deleting entry...";
    });

    util.postAjax("https://guestbook-1.herokuapp.com/entries", "DELETE", {}, function(status, response) {
      if (!response) {
        fastdom.mutate(function() {
          message.textContent = "No response from server.";
        });
        return;
      }

      fastdom.mutate(function() {
        message.textContent = response.message;
      });

      if (status === 200) populateGuestbook(0, true);
    });
  }

  function populateGuestbook(page, reset) {
    var message = util.id("message");
    var url = "https://guestbook-1.herokuapp.com/entries" + (page ? "?page=" + page : "");

    fastdom.mutate(function() {
      message.textContent = "Populating guestbook...";
    });

    util.postAjax(url, "GET", {}, function(status, response) {
      fastdom.mutate(function() {
        util.id("older").value = "Load Older";
      });

      if (!response) {
        fastdom.mutate(function() {
          message.textContent = "No response from server.";
        });
        return;
      }

      if (status !== 200) {
        fastdom.mutate(function() {
          message.textContent = response.message;
        });
        return;
      }

      var str = styleGuestbook(response.results, reset);

      fastdom.mutate(function() {
        message.textContent = response.message;

        if (reset) {
          util.id("guestbook-entries").innerHTML = str;
        } else {
          util.id("guestbook-entries").innerHTML += str;
        }

        if (response.yourEntry) {
          util.q("input[name='name']").value = response.yourEntry.name || "";
          util.q("input[name='message']").value = response.yourEntry.message || "";
          util.q("input[name='website']").value = response.yourEntry.website || "";
        }
      });
    });
  }

  function styleGuestbook(results, reset) {
    var result,
      str = "";

    for (var i = 0; i < results.length; i++) {
      result = results[i];

      str += "<li class='entry'><h3>";
      str += (result.name || "") + " <small>(";
      str += (result.date || "") + ")</small></h3><p>";
      str += (result.message || "") + "</p><p>";

      if (result.website) {
        str += "<a href='";
        str += (result.website || "") + "' target='_blank' rel='noopener'>";
        str += (result.website || "") + "</a>";
      }

      str += "</p><br></li>";
    }

    return str;
  }

  function loadolderGuestbook() {
    fastdom.mutate(function() {
      util.id("older").value = "Loading...";
    });

    populateGuestbook(Math.floor(util.qa(".entry").length / 10) + 1, false);
  }

  util.id("submit").onclick = submitGuestbook;
  util.id("delete").onclick = deleteGuestbook;
  util.id("refresh").onclick = function() {
    populateGuestbook(0, true);
  };
  util.id("older").onclick = loadolderGuestbook;

  populateGuestbook(0, true);
};
