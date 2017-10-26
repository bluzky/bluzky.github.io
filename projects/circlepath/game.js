var game;
var score = 0;
var ballDistance = 120;
var rotationSpeed = 4;
var angleRange = [25, 155];
var visibleTargets = 7;
var bgColors = [0x62bd18, 0xffbb00, 0xff5300, 0xd21034, 0xff475c, 0x8f16b2];
var acceptDistant = 30;


window.onload = function() {
  game = new Phaser.Game(640, 960, Phaser.AUTO, "game-canvas");
  game.state.add("PlayGame", playGame);
  game.state.add("Menu", menuState);

};

var gameManager = (function(game) {
  this.game = game;

  this.start = function() {
    score = 0;
    acceptDistant = 30;
    this.game.state.start("PlayGame");
  };

  this.getScore = function() {
    return score;
  };
  return this;
})(game);

menu.initialize(gameManager);
menu.startMenu.show();

var playGame = function(game) {};

playGame.prototype = {
  preload: function() {
    game.load.image("ball", "ball.png");
    game.load.image("target", "target.png");
    game.load.image("arm", "arm.png");
    game.load.audio("end", "start.wav");
    game.load.audio("tap", "tap.mp3");
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  },
  create: function() {
    this.savedData = localStorage.getItem("circlepath") == null ? {
      score: 0
    } : JSON.parse(localStorage.getItem("circlepath"));
    this.hud = new Hud(game, this.savedData.score.toString());
    this.hud.init();
    this.destroy = false;
    this.saveRotationSpeed = rotationSpeed;
    this.tintColor = bgColors[game.rnd.between(0, bgColors.length - 1)];
    do {
      this.tintColor2 = bgColors[game.rnd.between(0, bgColors.length - 1)];
    } while (this.tintColor == this.tintColor2);
    game.stage.backgroundColor = this.tintColor;
    this.targetArray = [];
    this.steps = 0;
    this.rotatingDirection = game.rnd.between(0, 1);
    this.gameGroup = game.add.group();
    this.targetGroup = game.add.group();
    this.ballGroup = game.add.group();
    this.gameGroup.add(this.targetGroup);
    this.gameGroup.add(this.ballGroup);
    this.arm = game.add.sprite(game.width / 2, game.height / 4 * 2.7, "arm");
    this.arm.anchor.set(0, 0.5);
    this.arm.tint = this.tintColor2;
    this.ballGroup.add(this.arm);
    this.balls = [
      game.add.sprite(game.width / 2, game.height / 4 * 2.7, "ball"),
      game.add.sprite(game.width / 2, game.height / 2, "ball")
    ];
    this.balls[0].anchor.set(0.5);
    this.balls[0].tint = this.tintColor2;
    this.balls[1].anchor.set(0.5);
    this.balls[1].tint = this.tintColor2;
    this.ballGroup.add(this.balls[0]);
    this.ballGroup.add(this.balls[1]);
    this.rotationAngle = 0;
    this.rotatingBall = 1;
    var target = game.add.sprite(0, 0, "target");
    target.anchor.set(0.5);
    target.x = this.balls[0].x;
    target.y = this.balls[0].y;
    this.targetGroup.add(target);
    this.targetArray.push(target);
    game.input.onDown.add(this.changeBall, this);
    for (var i = 0; i < visibleTargets; i++) {
      this.addTarget();
    }


    this.tapSound = game.add.audio('tap');
    this.endSound = game.add.audio('end');

  },
  update: function() {
    var distanceFromTarget = this.balls[this.rotatingBall].position.distance(this.targetArray[1].position);
    if (distanceFromTarget > 90 && this.destroy && this.steps > visibleTargets) {
      this.gameOver();
    }
    if (distanceFromTarget < acceptDistant && !this.destroy) {
      this.destroy = true;
    }
    this.rotationAngle = (this.rotationAngle + this.saveRotationSpeed * (this.rotatingDirection * 2 - 1)) % 360;
    this.arm.angle = this.rotationAngle + 90;
    this.balls[this.rotatingBall].x = this.balls[1 - this.rotatingBall].x - ballDistance * Math.sin(Phaser.Math.degToRad(this.rotationAngle));
    this.balls[this.rotatingBall].y = this.balls[1 - this.rotatingBall].y + ballDistance * Math.cos(Phaser.Math.degToRad(this.rotationAngle));
    var distanceX = this.balls[1 - this.rotatingBall].worldPosition.x - game.width / 2;
    var distanceY = this.balls[1 - this.rotatingBall].worldPosition.y - game.height / 4 * 2.7;
    this.gameGroup.x = Phaser.Math.linearInterpolation([this.gameGroup.x, this.gameGroup.x - distanceX], 0.05);
    this.gameGroup.y = Phaser.Math.linearInterpolation([this.gameGroup.y, this.gameGroup.y - distanceY], 0.05);
  },
  changeBall: function() {
    this.destroy = false;
    var distanceFromTarget = this.balls[this.rotatingBall].position.distance(this.targetArray[1].position);
    if (distanceFromTarget < acceptDistant) {
      this.rotatingDirection = game.rnd.between(0, 1);
      var detroyTween = game.add.tween(this.targetArray[0]).to({
        alpha: 0
      }, 500, Phaser.Easing.Cubic.In, true);
      detroyTween.onComplete.add(function(e) {
        e.destroy();
      });

      //  game.add.tween(this.targetArray[1]).to({
      //       scale: new PIXI.Point(2, 2)
      //  }, 500, Phaser.Easing.Cubic.Out, true);

      this.targetArray.shift();
      this.arm.position = this.balls[this.rotatingBall].position;
      this.rotatingBall = 1 - this.rotatingBall;
      this.rotationAngle = this.balls[1 - this.rotatingBall].position.angle(this.balls[this.rotatingBall].position, true) - 90;
      this.arm.angle = this.rotationAngle + 90;
      for (var i = 0; i < this.targetArray.length; i++) {
        this.targetArray[i].alpha += 1 / 7;
      }
      this.addTarget();
      this.hud.increaseScore(1);
      score++;
      this.tapSound.play();

      if (score > 5) {
        acceptDistant = Math.max(acceptDistant - score * 2, 20);
      }
    } else {
      this.gameOver();
    }
  },
  addTarget: function() {
    this.steps++;
    startX = this.targetArray[this.targetArray.length - 1].x;
    startY = this.targetArray[this.targetArray.length - 1].y;
    var target = game.add.sprite(0, 0, "target");
    var randomAngle = game.rnd.between(angleRange[0] + 90, angleRange[1] + 90);
    target.anchor.set(0.5);
    target.x = startX + ballDistance * Math.sin(Phaser.Math.degToRad(randomAngle));
    target.y = startY + ballDistance * Math.cos(Phaser.Math.degToRad(randomAngle));
    target.alpha = 1 - this.targetArray.length * (1 / 7);
    var style = {
      font: "bold 32px Arial",
      fill: "#" + this.tintColor.toString(16),
      align: "center"
    };
    var text = game.add.text(0, 0, this.steps.toString(), style);
    text.anchor.set(0.5);
    target.addChild(text);
    this.targetGroup.add(target);
    this.targetArray.push(target);
  },
  gameOver: function() {
    localStorage.setItem("circlepath", JSON.stringify({
      score: Math.max(this.savedData.score, this.steps - visibleTargets)
    }));
    game.input.onDown.remove(this.changeBall, this);
    this.saveRotationSpeed = 0;
    this.arm.destroy();
    var gameOverTween = game.add.tween(this.balls[1 - this.rotatingBall]).to({
      alpha: 0
    }, 1000, Phaser.Easing.Cubic.Out, true);

    var self = this;
    gameOverTween.onComplete.add(function() {
      self.endSound.play();
      menu.onloose(score);
      this.game.state.start("Menu");
    }, this);
  }
};

var menuState = function(game) {};
menuState.prototype.update = function() {};

var Hud = function(game, bestScore) {
  this.game = game;
  this.bestScore = bestScore;
  this.score = 0;
};

Hud.prototype.init = function() {
  var style = {
    font: "bold 22px Arial",
    fill: "#ffffff"
  };

  this.scoreBox = new ScoreBox(this.game, 50, 20, 200, 85, "SCORE", this.score);
  this.bestScoreBox = new ScoreBox(this.game, 390, 20, 200, 85, "BEST SCORE", this.bestScore);
};

Hud.prototype.increaseScore = function(increment) {
  this.score += increment;
  this.scoreBox.increaseScore(increment);
};


var ScoreBox = function(game, x, y, width, height, label, score) {
  this.game = game;
  this.score = score;
  this.label = label;
  this.padding = 10;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.init();
};

ScoreBox.prototype.init = function() {

  var graphics = game.add.graphics(0, 0);
  graphics.beginFill(0x000000, 0.7);
  graphics.drawRect(this.x, this.y, this.width, this.height);
  graphics.endFill();

  var labelStyle = {
    font: "bold 22px Arial",
    fill: "#ffffff"
  };
  this.labelText = this.game.add.text(this.x, this.y + this.padding, this.label, labelStyle);
  this.labelText.x = this.x + (this.width - this.labelText.width) / 2;

  var scoreStyle = {
    font: "bold 32px Arial",
    fill: "#ffffff"
  };
  this.scoreText = this.game.add.text(this.x, this.y + this.padding + this.labelText.height, this.score + "", scoreStyle);
  this.scoreText.x = this.x + (this.width - this.scoreText.width) / 2;
};

ScoreBox.prototype.setScore = function(score) {
  this.score = score;
  this.scoreText.text = score + "";
};

ScoreBox.prototype.increaseScore = function(increment) {
  this.score += increment;
  this.scoreText.text = this.score + "";
};
