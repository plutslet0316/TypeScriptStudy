var DrawingApp = /** @class */ (function () {
    function DrawingApp(canvas) {
        var _this = this;
        this.circles = [];
        this.colors = ["red", "green", "blue"];
        this.colorsCount = 0;
        this.redraw = function () {
            _this.context.fillStyle = "white";
            _this.context.fillRect(0, 0, _this.canvas.width, _this.canvas.height);
            for (var _i = 0, _a = _this.circles; _i < _a.length; _i++) {
                var circle = _a[_i];
                _this.drawCircle(circle);
                _this.moveCircle(circle);
            }
            requestAnimationFrame(_this.redraw);
        };
        this.valueChange = function () {
            var physics = {
                gravity: document.getElementById('gravity'),
                force: document.getElementById('force'),
                minSpeed: document.getElementById('minSpeed'),
                friction: document.getElementById('friction'),
                trampolin: document.getElementById('trampolin'),
            };
            document.getElementsByName("gravity")[0].innerText = _this.gravity = physics.gravity.value;
            document.getElementsByName("force")[0].innerText = _this.force = physics.force.value;
            document.getElementsByName("minSpeed")[0].innerText = _this.minSpeed = physics.minSpeed.value;
            document.getElementsByName("friction")[0].innerText = _this.friction = physics.friction.value;
            _this.trampolin = physics.trampolin.value;
            document.getElementsByName("trampolin")[0].innerText = _this.trampolin == 1 ? "OFF" : "ON";
        };
        this.addCircles = function (numbers) {
            var color = _this.getColor();
            _this.valueChange();
            for (var i = 0; i < numbers; i++) {
                _this.circles.push({
                    pos: {
                        x: _this.canvas.width * Math.random(),
                        y: _this.canvas.height * Math.random(),
                        xInc: (Math.random() > 0.5 ? 1 : -1) * 10 * Math.random() + 1,
                        yInc: 5,
                        xSpeed: 1,
                        ySpeed: 0.98,
                    },
                    radius: 32 * Math.random() + 8,
                    color: color
                });
            }
        };
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.valueChange();
        this.addCircles(10);
        requestAnimationFrame(this.redraw);
    }
    DrawingApp.prototype.drawCircle = function (circle) {
        this.context.fillStyle = circle.color;
        this.context.beginPath();
        this.context.arc(circle.pos.x, circle.pos.y, circle.radius, 0, 2 * Math.PI);
        this.context.fill();
    };
    DrawingApp.prototype.getColor = function () {
        var result = this.colors[this.colorsCount];
        this.colorsCount = (this.colorsCount + 1) % this.colors.length;
        return result;
    };
    DrawingApp.prototype.moveCircle = function (circle) {
        // + 안 붙이면 이상하게 작동합니다.
        var gravity = +this.gravity;
        var force = +this.force;
        var minSpeed = +this.minSpeed;
        var friction = +this.friction;
        var trampolin = +this.trampolin;
        circle.pos.x += (circle.pos.xInc * circle.pos.xSpeed);
        circle.pos.y += gravity + (circle.pos.yInc * circle.pos.ySpeed);
        // 힘이 작용하는 방향
        // 작용점 보다 현재 가속도가 낮으면 방향 바꿈
        if (circle.pos.ySpeed <= minSpeed) {
            circle.pos.yInc *= -1;
        }
        // 중력가속
        if (circle.pos.yInc <= 0) {
            circle.pos.ySpeed *= force;
        }
        else {
            circle.pos.ySpeed /= force;
        }
        // 영역
        if (circle.pos.x < 0 || circle.pos.x > this.canvas.width) {
            circle.pos.xSpeed *= friction;
            circle.pos.xInc *= -1;
        }
        if (circle.pos.y < circle.radius || circle.pos.y > this.canvas.height - circle.radius) {
            circle.pos.ySpeed *= force * trampolin;
            circle.pos.xSpeed *= friction;
            circle.pos.yInc *= -1;
        }
        // 바닥에서 정지
        if (circle.pos.y > this.canvas.height - circle.radius) {
            circle.pos.y = this.canvas.height - circle.radius;
        }
    };
    return DrawingApp;
}());
//# sourceMappingURL=main.js.map