class DrawingApp {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private readonly fpsInterval: number;
    private start: number;
    private then: number;

    private readonly circles: Circle[] = [];
    private readonly colors: readonly string[] = ["red", "green", "blue"];
    private colorsCount: number = 0;

    private gravity;    // 중력
    private force;      // 가속
    private minSpeed;   // 작용점
    private friction;   // 마찰
    private trampolin;  // 땅에 닿으면 튕겨내기

    constructor(canvas: HTMLCanvasElement, fps = 120) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.fpsInterval = 1000 / fps;

        this.valueChange();
        this.addCircles(10);

        requestAnimationFrame(this.redraw);
    }

    private redraw = (timestamp) => {
        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.start === undefined && this.then === undefined) {
            this.start = window.performance.now();  // 시작 값
            this.then = window.performance.now();   // 이후 변하는 값
            // console.log(this.start + " " + this.then)
        }

        for (const circle of this.circles) {
            this.drawCircle(circle);
        }

        for (let elapsed = timestamp - this.then;
            elapsed >= this.fpsInterval;
            elapsed -= this.fpsInterval) {
            this.then = timestamp - (elapsed % this.fpsInterval);

            for (const circle of this.circles) {
                this.moveCircle(circle);
            }
        }

        requestAnimationFrame(this.redraw);
    }

    private drawCircle(circle: Circle) {
        this.context.fillStyle = circle.color;
        this.context.beginPath();
        this.context.arc(circle.pos.x, circle.pos.y, circle.radius, 0, 2 * Math.PI);
        this.context.fill();
    }

    private getColor(): string {
        let result = this.colors[this.colorsCount];
        this.colorsCount = (this.colorsCount + 1) % this.colors.length;
        return result;
    }

    private moveCircle(circle: Circle) {
        // + 안 붙이면 이상하게 작동합니다.
        let gravity = +this.gravity;
        let force = +this.force;
        let minSpeed = +this.minSpeed;
        let friction = +this.friction;
        let trampolin = +this.trampolin;

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
        } else {
            circle.pos.ySpeed /= force;
        }

        // 영역
        if (circle.pos.x < circle.radius || circle.pos.x > this.canvas.width - circle.radius) {
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
    }

    public valueChange = () => {
        let physics: Physics = {
            gravity: <HTMLInputElement>document.getElementById('gravity'),
            force: <HTMLInputElement>document.getElementById('force'),
            minSpeed: <HTMLInputElement>document.getElementById('minSpeed'),
            friction: <HTMLInputElement>document.getElementById('friction'),
            trampolin: <HTMLInputElement>document.getElementById('trampolin'),
        }

        document.getElementsByName("gravity")[0].innerText = this.gravity = physics.gravity.value;
        document.getElementsByName("force")[0].innerText = this.force = physics.force.value;
        document.getElementsByName("minSpeed")[0].innerText = this.minSpeed = physics.minSpeed.value;
        document.getElementsByName("friction")[0].innerText = this.friction = physics.friction.value;
        this.trampolin = physics.trampolin.value;
        document.getElementsByName("trampolin")[0].innerText = this.trampolin == 1 ? "OFF" : "ON";
    };

    public addCircles = (numbers: number) => {
        var color = this.getColor();
        this.valueChange();

        for (var i = 0; i < numbers; i++) {
            let x = this.canvas.width * Math.random();

            // x가 영역을 벗어나지 않도록 
            x = x < 42 ? 46 : x > this.canvas.width - 42 ? this.canvas.width - 46 : x;

            this.circles.push({
                pos: {
                    x: x,
                    y: this.canvas.height * Math.random(),
                    xInc: (Math.random() > 0.5 ? 1 : -1) * 10 * Math.random() + 1,
                    yInc: 5,
                    xSpeed: 1,
                    ySpeed: 0.98,
                },
                radius: 32 * Math.random() + 8,
                color: color
            })
        }
    }
}

type Circle = {
    pos: Position;
    readonly radius: number;
    readonly color: string;
}

type Position = {
    x: number;
    y: number;
    xInc: number;
    yInc: number;
    xSpeed: number;
    ySpeed: number;
}

type Physics = {
    gravity: HTMLInputElement,
    force: HTMLInputElement,
    minSpeed: HTMLInputElement,
    friction: HTMLInputElement,
    trampolin: HTMLInputElement,
}