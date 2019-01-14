module.exports = (function() {
  function vh(n) {
    return (n * windowHeight) / 100;
  }

  function vw(n) {
    return (n * windowWidth) / 100;
  }

  function vmin(n) {
    return windowWidth < windowHeight ? vw(n) : vh(n);
  }

  function id(id) {
    return document.getElementById(id);
  }

  function q(str) {
    return document.querySelector(str);
  }

  function qa(str) {
    return document.querySelectorAll(str);
  }

  function isDistanceSmallerThanValue(ax, ay, bx, by, d) {
    if (Math.abs(ax - bx) >= d * 1.5 || Math.abs(ay - by) >= d * 1.5) {
      return 0;
    }

    if (Math.pow(ax - bx, 2) + Math.pow(ay - by, 2) >= d * d) {
      return 0;
    }

    return 1;
  }

  function postAjax(url, method, data, success) {
    var xhr = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

    xhr.onreadystatechange = function() {
      if (xhr.readyState > 3) success(xhr.status, xhr.responseText ? JSON.parse(xhr.responseText) : null);
    };

    xhr.open(method, url);
    xhr.send(JSON.stringify(data));
  }

  function registerFastClick(elem, execute) {
    var state = 0;

    elem.ontouchstart = function(e) {
      e.preventDefault();
      execute(0, elem);
      state = 1;
    };

    elem.onmousedown = function(e) {
      e.preventDefault();
      execute(state, elem);
      state = 0;
    };
  }

  return {
    vh: vh,
    vw: vw,
    vmin: vmin,

    id: id,
    q: q,
    qa: qa,

    isDistanceSmallerThanValue: isDistanceSmallerThanValue,
    registerFastClick: registerFastClick,
    postAjax: postAjax
  };
})();
