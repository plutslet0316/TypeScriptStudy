var total;
var DrawingApp = /** @class */ (function () {
    function DrawingApp(canvas, fps) {
        if (fps === void 0) { fps = 60; }
        var _this = this;
        this.actors = [];
        this.enemys = [];
        this.bossEnemy = [];
        this.attackInterval = 100;
        this.attackDelay = 100;
        this.keys = {};
        this.touchPos = { x: 0, y: 0 };
        // 키 입력
        this.keyInput = function () {
            var speed = 1;
            _this.input.xSpeed = 0;
            _this.input.ySpeed = 0;
            // 키 누름 여부
            var keyLeft = _this.keys["Left"] || _this.keys["ArrowLeft"];
            var keyRight = _this.keys["Right"] || _this.keys["ArrowRight"];
            var keyUp = _this.keys["Up"] || _this.keys["ArrowUp"];
            var keyDown = _this.keys["Down"] || _this.keys["ArrowDown"];
            var keyAttack = _this.keys["Z"] || _this.keys["z"];
            // 좌우 움직임
            if (keyRight)
                _this.input.xSpeed = speed;
            if (keyLeft)
                _this.input.xSpeed = -speed;
            // if (keyLeft && keyRight)    this.xSpeed = 0;        // 동시 입력시 멈춤
            //상하 움직임
            if (keyDown)
                _this.input.ySpeed = speed;
            if (keyUp)
                _this.input.ySpeed = -speed;
            // if (keyUp && keyDown)       this.ySpeed = 0;        // 동시 입력시 멈춤
            // 쉬프트 가속
            if (_this.keys["Shift"]) {
                _this.input.xSpeed = _this.input.xSpeed * 1.5;
                _this.input.ySpeed = _this.input.ySpeed * 2;
            }
            // 공격
            if (keyAttack)
                _this.input.isAttack = true;
            else
                _this.input.isAttack = false;
        };
        // requestAnimationFrame의 콜백으로 timestamp가 자동으로 넘어옴
        this.update = function (timestamp) {
            _this.context.fillStyle = "black";
            _this.context.fillRect(0, 0, _this.canvas.width, _this.canvas.height);
            // 환경에 맞게 계산
            _this.drawLoop(_this.actors);
            _this.drawLoop(_this.enemys);
            _this.drawLoop(_this.bossEnemy);
            // 적 제거
            deleteObjet(_this.enemys, "isDelete");
            deleteObjet(_this.bossEnemy, "isDelete");
            // 키보드 입력 감지
            _this.keyInput();
            // 현재 퍼포먼스를 저장해두기
            if (_this.start === undefined && _this.then === undefined) {
                _this.start = window.performance.now(); // 시작 값
                _this.then = window.performance.now(); // 이후 변하는 값
                // console.log(this.start + " " + this.then)
            }
            // 항상 같은 속도로 계산
            for (var elapsed = timestamp - _this.then; // 지나간 시간 = 현재 시간 - then 으로 시작
             elapsed >= _this.fpsInterval; // 지나간 시간이 간격보다 높거나 같아질 때 까지 반복
             elapsed -= _this.fpsInterval) // 지나간 시간에서 간격만큼 빼고 다시 시작
             {
                _this.then = timestamp - (elapsed % _this.fpsInterval);
                // 엑터 계산
                _this.calcLoop(_this.actors);
                _this.calcLoop(_this.enemys);
                _this.calcLoop(_this.bossEnemy);
                // 데미지 계산
                _this.damegedCheck(_this.charator.bullets, _this.enemys);
                _this.damegedCheck(_this.charator.bullets, _this.bossEnemy);
            }
            // 공격
            var attackElapsed = timestamp - _this.attackDelay;
            if (attackElapsed >= _this.attackInterval) {
                _this.attackDelay = timestamp - (attackElapsed % _this.attackInterval);
                _this.attackLoop(_this.charator, _this.input.isAttack);
            }
            // 보스 소환
            if (!_this.boss && total >= 50) {
                _this.isBoss = true;
            }
            if (_this.isBoss && !_this.boss) {
                _this.boss = true;
                _this.bossEnemy.push(new EnemeActor(_this.drawContext, "assets/RFly1.png", 0.5, 200, 2));
            }
            if (_this.bossEnemy.length == 0) {
                _this.isBoss = false;
            }
            // 적 소환
            if (!_this.isBoss) {
                var enemyElapsed = timestamp - _this.enemyDelay;
                if (enemyElapsed >= _this.enemyInterval) {
                    _this.enemys.push(new EnemeActor(_this.drawContext, "assets/RFly1.png", 5, 5));
                    _this.enemyDelay = timestamp - (enemyElapsed % _this.enemyInterval);
                    _this.enemyInterval = (2500 * Math.random());
                }
            }
            requestAnimationFrame(_this.update);
        };
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.fpsInterval = 1000 / fps;
        this.enemyInterval = 5000 * Math.random();
        this.enemyDelay = 5000;
        this.boss = false;
        this.isBoss = false;
        this.input = {
            xSpeed: 0,
            ySpeed: 0,
            isAttack: false,
        };
        var drawContext = {
            width: canvas.width,
            height: canvas.height,
            crc: this.context
        };
        this.drawContext = drawContext;
        // 키보드 누름 & 뗌
        window.addEventListener("keydown", function (e) { _this.keys[e.key] = true; }, false);
        window.addEventListener("keyup", function (e) { _this.keys[e.key] = false; }, false);
        // 마우스 & 터치 움직임 감지
        var moveEvent = function (e) {
            console.log(_this.touchPos);
            if (e instanceof MouseEvent) {
                _this.touchPos.x = e.clientX;
                _this.touchPos.y = e.clientY;
            }
            else if (e instanceof TouchEvent) {
                _this.touchPos.x = e.changedTouches[0].clientX;
                _this.touchPos.y = e.changedTouches[0].clientY;
            }
        };
        // 마우스 공격
        canvas.addEventListener("mousedown", function (e) { _this.keys["Z"] = true; }, false);
        canvas.addEventListener("mouseup", function (e) { _this.keys["Z"] = false; }, false);
        // 마우스 움직임
        canvas.addEventListener("mousemove", moveEvent, false);
        canvas.addEventListener("mouseenter", moveEvent, false);
        canvas.addEventListener("mouseleave", function (e) { _this.touchPos.x = 0; _this.touchPos.y = 0; }, false);
        // 터치시 공격 & 움직임
        canvas.addEventListener("touchstart", function (e) { _this.keys["Z"] = true; }, false);
        canvas.addEventListener("touchmove", moveEvent, false);
        canvas.addEventListener("touchend", function (e) { _this.keys["Z"] = false; _this.touchPos.x = 0; _this.touchPos.y = 0; }, false);
        this.charator = new CharacterActor(drawContext, { "origin": "assets/Fly1.png", "attack": "assets/Bullet.png" }, 10);
        this.score = new ScoreActor(drawContext);
        // this.actors.push(new ScrolledBackActor(drawContext, "assets/back1.png", 0.4));
        // this.actors.push(new ScrolledBackActor(drawContext, "assets/back2.png", 0.8));
        // this.actors.push(new ScrolledBackActor(drawContext, "assets/back3.png", 1.5));
        this.actors.push(new ScrolledBackActor(drawContext, "assets/BG.png", 10));
        this.actors.push(this.charator);
        this.actors.push(this.score);
        this.actors.push(new FadeInActor(this.drawContext));
        // this.actors.push(new TitleTextActor(drawContext, "TypeScript Study"));
        requestAnimationFrame(this.update);
    }
    DrawingApp.prototype.drawLoop = function (actors) {
        for (var _i = 0, actors_1 = actors; _i < actors_1.length; _i++) {
            var actor = actors_1[_i];
            actor.draw();
        }
    };
    DrawingApp.prototype.calcLoop = function (actors) {
        for (var _i = 0, actors_2 = actors; _i < actors_2.length; _i++) {
            var actor = actors_2[_i];
            actor.calc(this.input.xSpeed, this.input.ySpeed, this.touchPos.x, this.touchPos.y); // 매개변수가 필요하면 알아서 가져다 씀
        }
    };
    DrawingApp.prototype.attackLoop = function (actor, isAttack) {
        actor.attack(isAttack);
    };
    DrawingApp.prototype.damegedCheck = function (selfs, targets) {
        for (var _i = 0, targets_1 = targets; _i < targets_1.length; _i++) {
            var target = targets_1[_i];
            for (var _a = 0, selfs_1 = selfs; _a < selfs_1.length; _a++) {
                var self_1 = selfs_1[_a];
                target.demage(self_1.x, self_1.y);
                self_1.demage(target.x, target.y, target.image.width, target.image.height, target.ratio == undefined ? 1 : target.ratio);
            }
        }
        return total;
    };
    return DrawingApp;
}());
var TitleTextActor = /** @class */ (function () {
    function TitleTextActor(context, texts) {
        this.fade = 0;
        this.context = context;
        this.texts = texts;
    }
    TitleTextActor.prototype.draw = function () {
        var c = this.context.crc;
        c.font = "bold 48px serif";
        c.textAlign = "center";
        c.fillStyle = "blue";
        c.globalAlpha = this.fade;
        c.fillText(this.texts, this.context.width / 2, this.context.height / 2);
        c.globalAlpha = 1;
    };
    TitleTextActor.prototype.calc = function () {
        if (this.fade < 0.8) {
            this.fade += 0.005;
        }
    };
    return TitleTextActor;
}());
var FadeInActor = /** @class */ (function () {
    function FadeInActor(context) {
        this.fade = 1;
        this.context = context;
    }
    FadeInActor.prototype.draw = function () {
        var c = this.context.crc;
        if (this.fade > 0) {
            c.globalAlpha = this.fade;
            c.fillStyle = "black";
            c.fillRect(0, 0, this.context.width, this.context.height);
            c.globalAlpha = 1;
        }
    };
    FadeInActor.prototype.calc = function () {
        this.fade -= 0.005;
    };
    return FadeInActor;
}());
var ScrolledBackActor = /** @class */ (function () {
    function ScrolledBackActor(context, imageFilename, speed) {
        this.context = context;
        this.image = new Image();
        this.image.src = imageFilename;
        this.speed = speed;
        this.setup();
    }
    ScrolledBackActor.prototype.setup = function () {
        var ratio = (this.context.width / this.image.naturalWidth) < (this.context.height / this.image.naturalHeight) ?
            this.context.width / this.image.naturalWidth : this.context.height / this.image.naturalHeight;
        this.image.width = this.image.naturalWidth * ratio;
        this.image.height = this.image.naturalHeight * ratio;
        this.x1 = 0;
        this.x2 = this.image.width - 2;
        this.x3 = (this.image.width * 2) - 4;
    };
    ScrolledBackActor.prototype.draw = function () {
        if (this.image.width == 0) {
            this.setup();
        }
        var c = this.context.crc;
        c.drawImage(this.image, this.x1, 0, this.image.width, this.image.height);
        c.drawImage(this.image, this.x2, 0, this.image.width, this.image.height);
        c.drawImage(this.image, this.x3, 0, this.image.width, this.image.height);
    };
    ScrolledBackActor.prototype.calc = function (xSpeed) {
        // 가속시 배경도 빠르게 지나가게 만들려면 보완이 필요하다
        this.x1 -= this.speed; // * (xSpeed != 0 ? Math.abs(xSpeed) : 1);  
        this.x2 -= this.speed; // * (xSpeed != 0 ? Math.abs(xSpeed) : 1);
        this.x3 -= this.speed; // * (xSpeed != 0 ? Math.abs(xSpeed) : 1);
        if (this.x1 + this.image.width < 2) {
            this.x1 = 0;
            this.x2 = this.image.width - 2;
            this.x3 = (this.image.width * 2) - 4;
        }
    };
    return ScrolledBackActor;
}());
var EnemeActor = /** @class */ (function () {
    function EnemeActor(context, imageFilename, speed, maxHealth, ratio) {
        if (ratio === void 0) { ratio = 1; }
        var _this = this;
        this.demage = function (x, y) {
            var xCheck = _this.x - (_this.image.width * 1.5 / _this.ratio) <= x && x <= _this.x + (_this.image.width / 2 / _this.ratio);
            var yCheck = _this.y - (_this.image.height / 2 / _this.ratio) <= y && y <= _this.y + (_this.image.height / 2);
            if (xCheck && yCheck) {
                _this.health--;
            }
            if (_this.health <= 0) {
                _this.isDelete = true;
                if (!_this.isScore) {
                    total += 1;
                    _this.isScore = true;
                }
            }
            return 0;
        };
        this.context = context;
        this.speed = speed;
        this.ratio = ratio;
        this.maxHealth = maxHealth;
        this.health = this.maxHealth;
        this.isDelete = false;
        this.image = new Image();
        this.image.src = imageFilename;
        this.setup();
    }
    EnemeActor.prototype.setup = function () {
        this.image.width = (this.image.naturalWidth / 4) * this.ratio;
        this.image.height = (this.image.naturalHeight / 4) * this.ratio;
        this.x = this.context.width;
        this.y = (this.context.height - this.image.height) * Math.random();
    };
    EnemeActor.prototype.draw = function () {
        if (this.image.width == 0) {
            this.setup();
        }
        var c = this.context.crc;
        var widht = this.x + this.image.width / 5;
        var height = this.y - this.image.height / 4;
        var hp = this.image.width / 2;
        c.fillStyle = "black";
        c.fillRect(widht, height, hp, 10);
        c.fillStyle = "#ff4444";
        c.fillRect(widht, height, hp * (this.health / this.maxHealth), 10);
        c.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
    };
    EnemeActor.prototype.calc = function () {
        this.x -= this.speed;
        if (this.image && this.x + this.image.width <= 0) {
            this.isDelete = true;
        }
    };
    EnemeActor.prototype.attack = function (isAttack) {
    };
    return EnemeActor;
}());
var CharacterActor = /** @class */ (function () {
    function CharacterActor(context, imageFilenames, speed) {
        this.context = context;
        this.imageFilenames = imageFilenames;
        this.speed = speed;
        this.image = new Image();
        this.image.src = this.imageFilenames["origin"];
        this.bullets = [];
        this.bulletImage = new Image();
        this.bulletImage.src = this.imageFilenames["attack"];
        this.setup();
    }
    CharacterActor.prototype.setup = function () {
        this.image.width = this.image.naturalWidth / 4;
        this.image.height = this.image.naturalHeight / 4;
        this.bulletImage.width = this.bulletImage.naturalWidth / 4;
        this.bulletImage.height = this.bulletImage.naturalHeight / 4;
        this.x = this.context.width / 4;
        this.y = this.context.height / 2;
    };
    CharacterActor.prototype.draw = function () {
        if (this.image.width == 0) {
            this.setup();
        }
        if (this.bulletImage.width == 0) {
            this.setup();
        }
        var c = this.context.crc;
        c.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
        // console.log(this.score);
        if (this.bullets.length != 0) {
            for (var _i = 0, _a = this.bullets; _i < _a.length; _i++) {
                var bullet = _a[_i];
                c.drawImage(bullet.image, bullet.x + this.image.width, bullet.y + this.image.height / 2, bullet.image.width, bullet.image.height);
            }
        }
    };
    CharacterActor.prototype.calc = function (xSpeed, ySpeed, xPos, yPos) {
        if (xPos)
            this.x = xPos - this.image.width / 2;
        else
            this.x += this.speed * xSpeed;
        if (yPos)
            this.y = yPos - this.image.height / 2;
        else
            this.y += this.speed * ySpeed;
        // 영역
        if (this.y <= 0) {
            this.y = 0;
        }
        else if (this.y >= this.context.height - this.image.height) {
            this.y = this.context.height - this.image.height;
        }
        if (this.x <= 0) {
            this.x = 0;
        }
        else if (this.x >= this.context.width - this.image.width) {
            this.x = this.context.width - this.image.width;
        }
        if (this.bullets.length != 0) {
            for (var _i = 0, _a = this.bullets; _i < _a.length; _i++) {
                var bullet = _a[_i];
                bullet.x += bullet.speed;
                // 화면 나가면 삭제
                if (bullet.x >= this.context.width - bullet.image.width) {
                    bullet.isDelete = true;
                }
            }
            deleteObjet(this.bullets, "isDelete");
        }
    };
    CharacterActor.prototype.attack = function (isAttack) {
        if (isAttack) {
            this.bullets.push(new BulletActor(this.bulletImage, 20, this.x, this.y));
        }
    };
    CharacterActor.prototype.demage = function (x, y, xLimit, yLimit) {
    };
    return CharacterActor;
}());
var BulletActor = /** @class */ (function () {
    function BulletActor(image, speed, x, y) {
        var _this = this;
        this.demage = function (x, y, xLimit, yLimit, ratio) {
            var xCheck = _this.x - (xLimit / 2 / ratio) <= x && x <= _this.x + (xLimit * 1.5 / ratio);
            var yCheck = _this.y - (yLimit / 2) <= y && y <= _this.y + (yLimit / 2 / ratio);
            if (xCheck && yCheck) {
                // console.log("총알")
                _this.isDelete = true;
            }
        };
        this.image = image;
        this.speed = speed;
        this.x = x;
        this.y = y;
        this.isDelete = false;
    }
    return BulletActor;
}());
var ScoreActor = /** @class */ (function () {
    function ScoreActor(context) {
        this.context = context;
        total = 0;
        this.start = new Date();
        this.then = new Date();
        this.width = this.context.width / 10;
        this.height = this.context.height / 10;
    }
    ScoreActor.prototype.draw = function () {
        this.then = new Date();
        var c = this.context.crc;
        var time = new Date(this.then.getTime() - this.start.getTime());
        var text = (time.getMinutes() <= 9 ? "0" : "") + time.getMinutes() + ":" + (time.getSeconds() <= 9 ? "0" : "") + time.getSeconds();
        c.fillStyle = "purple";
        c.fillRect(0, 0, this.width + 60, this.height + 30);
        c.font = "bold 24px serif";
        c.fillStyle = "white";
        c.textAlign = "right";
        c.fillText(total.toString(), this.width + 40, this.height, this.width + 60);
        c.fillText(text, this.width + 40, this.height - 30, this.width + 60);
        c.textAlign = "left";
        c.fillText("시간:", 20, this.height - 30, this.width + 60);
        c.fillText("점수:", 20, this.height, this.width + 60);
        c.globalAlpha = 1;
    };
    ScoreActor.prototype.calc = function (xSpeed, ySpeed) {
    };
    return ScoreActor;
}());
// 제네릭을 이용해 받은 key가 true이거나 받은 value와 같으면 해당되는 obj를 삭제히는 함수
function deleteObjet(objs, key, value) {
    var _loop_1 = function (obj) {
        var check = !!obj[key];
        if (value != undefined && typeof obj[key] == typeof value)
            check = obj[key] == value;
        //console.log("실행")
        if (check) {
            // 필터를 통해 현재 값과 같은 obj만 골라내고
            // indexof와 splice를 통해 삭제
            objs.splice(objs.indexOf(objs.filter(function (item) {
                if (item[key] == obj[key]) {
                    //console.log("삭제")
                    return true;
                }
                return false;
            })[0]), 1);
        }
    };
    for (var _i = 0, objs_1 = objs; _i < objs_1.length; _i++) {
        var obj = objs_1[_i];
        _loop_1(obj);
    }
}
//# sourceMappingURL=main.js.map