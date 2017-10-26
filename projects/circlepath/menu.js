var _level = 0;
var looseCount = 0;
var Menu = (function() {

  var Menu = function(menuId, eventMap) {
    this.container = document.getElementById(menuId);
    this._bindEvents(eventMap);
  };

  Menu.prototype._bindEvents = function(eventMap) {
    var self = this;
    Object.keys(eventMap).map(function(key, index) {
      var parts = key.split(" ");
      var eventName = parts[0];
      var selector = parts[1];

      var targets = self.container.querySelectorAll(selector);
      if (typeof eventMap[key] === "function") {
        self._bindEvent(targets, eventName, eventMap[key]);
      }
    });
  };

  Menu.prototype._bindEvent = function(elements, eventName, callback) {
    if (elements.length == undefined) {
      elements.addEventListener(eventName, callback);
    } else {
      for (var i = 0; i < elements.length; i++) {
        this._bindEvent(elements[i], eventName, callback);
      }
    }
  };

  Menu.prototype.show = function() {
    document.body.style.overflow = "hidden";
    this.container.style.display = "block";
  };

  Menu.prototype.hide = function() {
    document.body.style.overflow = "auto";
    this.container.style.display = "none";
  };

  Menu.prototype.findFirst = function(selector) {
    var els = this.container.querySelectorAll(selector);
    return els[0] || {};
  };

  return Menu;
})();

var MenuManager = (function() {
  var MenuManager = function() {
    this.menuMap = {};
  };

  MenuManager.prototype.addMenu = function(name, menu) {
    this.menuMap[name] = menu;
  };

  MenuManager.prototype.removeMenu = function(name) {
    delete(this.menuMap[name]);
  };

  MenuManager.prototype.get = function(name) {
    return this.menuMap[name];
  };

  MenuManager.prototype.show = function(name) {
    if (this.menuMap.hasOwnProperty(name)) {
      for (var k in this.menuMap) {
        this.menuMap[k].hide();
      }

      this.menuMap[name].show();
    }
  };

  MenuManager.prototype.hideAll = function() {
    for (var k in this.menuMap) {
      this.menuMap[k].hide();
    }
  };

  return MenuManager;
})();

var GameMenu = (function() {
  var menu = function() {};

  menu.prototype.initialize = function(newGame) {
    this.game = newGame;
    this.startMenu = new Menu("start-screen", {
      "click .js-btn-play": this.onstart.bind(this),
      "click .js-btn-help": function() {
        self.menuManager.show('help');
      },
    });

    this.endMenu = new Menu("win-screen", {
      "click .js-btn-replay": this.onstart.bind(this),
      "click .js-btn-share": this.onshare.bind(this)
    });

    var self = this;
    var help = new Menu("help-screen", {
      "click .js-btn-ok": function() {
        self.menuManager.show('startmenu');
      },
    });

    this.menuManager = new MenuManager();
    this.menuManager.addMenu("startmenu", this.startMenu);
    this.menuManager.addMenu("endmenu", this.endMenu);
    this.menuManager.addMenu("help", help);
  };

  menu.prototype.onstart = function() {
    this.game.start();
    this.menuManager.hideAll();
  };

  menu.prototype.onloose = function(score) {
    this.endMenu.findFirst(".js-score").innerHTML = score;
    this.menuManager.show('endmenu');

    looseCount++;
    if (looseCount % 7 == 0) {
      // gotoSchem("mofiin://ads/full_screen", function(){});
    }

    // save score
    var score = this.game.getScore();
    window.setTimeout(function() {
      gotoSchem("mofiin://games/save_score?score=" + score + "&level=" + score, function() {});
    }, 100);
  };


  menu.prototype.onshare = function() {
    var self = this;
    gotoSchem("mofiin://games/share_score", function() {
      MofiinGame.shareFB({
        score: this.game.score
      });
    });
  };

  return menu;
})();

var menu = new GameMenu();
