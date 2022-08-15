let total: number;

class DrawingApp {
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private readonly actors: IActor[] = [];
    private readonly drawContext;
    private readonly fpsInterval: number;
    private enemys: IEneme[] = [];
    private bossEnemy: IEneme[] = [];
    private charator: ICharacter;
    private score: IScore;
    private attackInterval: number = 100;
    private attackDelay: number = 100;
    private isBoss: boolean;
    private boss: boolean;

    private start: number;
    private then: number;

    private enemyInterval: number;
    private enemyDelay: number;

    private keys: Keys = {};
    private touchPos: TouchPos =  { x: 0, y: 0 };
    private input: Input;

    constructor(canvas: HTMLCanvasElement, fps = 60) {
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

        const drawContext = {
            width: canvas.width,
            height: canvas.height,
            crc: this.context
        };
        this.drawContext = drawContext;


        // 키보드 누름 & 뗌
        window.addEventListener("keydown", (e: KeyboardEvent) => { this.keys[e.key] = true; }, false);
        window.addEventListener("keyup", (e: KeyboardEvent) => { this.keys[e.key] = false; }, false);


        // 마우스 & 터치 움직임 감지
        const moveEvent = (e: MouseEvent | TouchEvent) => {
            console.log(this.touchPos)
            if(e instanceof MouseEvent) {
                this.touchPos.x = e.clientX
                this.touchPos.y = e.clientY
            }
            else if(e instanceof TouchEvent){
                this.touchPos.x = e.changedTouches[0].clientX
                this.touchPos.y = e.changedTouches[0].clientY
            }
        }

        // 마우스 공격
        canvas.addEventListener("mousedown", (e: MouseEvent) => { this.keys["Z"] = true; }, false);
        canvas.addEventListener("mouseup", (e: MouseEvent) => { this.keys["Z"] = false; }, false);

        // 마우스 움직임
        canvas.addEventListener("mousemove", moveEvent, false);
        canvas.addEventListener("mouseenter",moveEvent, false);
        canvas.addEventListener("mouseleave", (e: MouseEvent) => { this.touchPos.x = 0; this.touchPos.y = 0}, false);


        // 터치시 공격 & 움직임
        canvas.addEventListener("touchstart", (e: TouchEvent) => { this.keys["Z"] = true; }, false);
        canvas.addEventListener("touchmove", moveEvent, false)
        canvas.addEventListener("touchend", (e: TouchEvent) => { this.keys["Z"] = false; this.touchPos.x = 0; this.touchPos.y = 0}, false);


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


    // 키 입력
    private keyInput = () => {
        const speed = 1;
        this.input.xSpeed = 0;
        this.input.ySpeed = 0;

        // 키 누름 여부
        const keyLeft = this.keys["Left"] || this.keys["ArrowLeft"];
        const keyRight = this.keys["Right"] || this.keys["ArrowRight"];
        const keyUp = this.keys["Up"] || this.keys["ArrowUp"];
        const keyDown = this.keys["Down"] || this.keys["ArrowDown"];
        const keyAttack = this.keys["Z"] || this.keys["z"];

        // 좌우 움직임
        if (keyRight) this.input.xSpeed = speed;
        if (keyLeft) this.input.xSpeed = -speed;
        // if (keyLeft && keyRight)    this.xSpeed = 0;        // 동시 입력시 멈춤

        //상하 움직임
        if (keyDown) this.input.ySpeed = speed;
        if (keyUp) this.input.ySpeed = -speed;
        // if (keyUp && keyDown)       this.ySpeed = 0;        // 동시 입력시 멈춤

        // 쉬프트 가속
        if (this.keys["Shift"]) {
            this.input.xSpeed = this.input.xSpeed * 1.5;
            this.input.ySpeed = this.input.ySpeed * 2;
        }

        // 공격
        if (keyAttack) this.input.isAttack = true;
        else this.input.isAttack = false;
    }

    // requestAnimationFrame의 콜백으로 timestamp가 자동으로 넘어옴
    private update = (timestamp) => {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 환경에 맞게 계산
        this.drawLoop(this.actors);
        this.drawLoop(this.enemys);
        this.drawLoop(this.bossEnemy);

        // 적 제거
        deleteObjet(this.enemys, "isDelete");
        deleteObjet(this.bossEnemy, "isDelete");

        // 키보드 입력 감지
        this.keyInput()

        // 현재 퍼포먼스를 저장해두기
        if (this.start === undefined && this.then === undefined) {
            this.start = window.performance.now();  // 시작 값
            this.then = window.performance.now();   // 이후 변하는 값
            // console.log(this.start + " " + this.then)
        }

        // 항상 같은 속도로 계산
        for (let elapsed = timestamp - this.then;   // 지나간 시간 = 현재 시간 - then 으로 시작
            elapsed >= this.fpsInterval;            // 지나간 시간이 간격보다 높거나 같아질 때 까지 반복
            elapsed -= this.fpsInterval)            // 지나간 시간에서 간격만큼 빼고 다시 시작
        {
            this.then = timestamp - (elapsed % this.fpsInterval);

            // 엑터 계산
            this.calcLoop(this.actors);
            this.calcLoop(this.enemys);
            this.calcLoop(this.bossEnemy);


            // 데미지 계산
            this.damegedCheck(this.charator.bullets, this.enemys)
            this.damegedCheck(this.charator.bullets, this.bossEnemy)
        }

        // 공격
        let attackElapsed = timestamp - this.attackDelay;
        if (attackElapsed >= this.attackInterval) {
            this.attackDelay = timestamp - (attackElapsed % this.attackInterval);

            this.attackLoop(this.charator, this.input.isAttack);
        }

        // 보스 소환
        if (!this.boss && total >= 50) {
            this.isBoss = true;
        }

        if (this.isBoss && !this.boss) {
            this.boss = true;
            this.bossEnemy.push(new EnemeActor(this.drawContext, "assets/RFly1.png", 0.5, 200, 2));
        }

        if (this.bossEnemy.length == 0) {
            this.isBoss = false
        }

        // 적 소환
        if (!this.isBoss) {
            let enemyElapsed = timestamp - this.enemyDelay;
            if (enemyElapsed >= this.enemyInterval) {
                this.enemys.push(new EnemeActor(this.drawContext, "assets/RFly1.png", 5, 5));

                this.enemyDelay = timestamp - (enemyElapsed % this.enemyInterval);
                this.enemyInterval = (2500 * Math.random());
            }
        }

        requestAnimationFrame(this.update);
    }

    private drawLoop(actors: IActor[]) {
        for (const actor of actors) {
            actor.draw();
        }
    }

    private calcLoop(actors: IActor[]) {
        for (const actor of actors) {
            actor.calc(this.input.xSpeed, this.input.ySpeed, this.touchPos.x, this.touchPos.y);   // 매개변수가 필요하면 알아서 가져다 씀
        }
    }

    private attackLoop(actor: isAttackable, isAttack: boolean) {
        actor.attack(isAttack);
    }

    private damegedCheck<Self extends ImageXY & { demage: Demaged}, Target extends  ImageXY & { demage: Demaged, ratio?: number}>
        (selfs: Self[], targets: Target[]): number
    {
        for (const target of targets) {
            for (const self of selfs) {
                target.demage(self.x, self.y)
                self.demage(target.x, target.y, target.image.width, target.image.height, target.ratio == undefined ? 1 : target.ratio)
            }
        }
        return total;
    }
}


interface IActor {
    draw();
    calc(xSpeed?: number, ySpeed?: number, xPos?: number, yPos?: number);
}

interface isAttackable extends IActor {
    health: number;
    attack(isAttack: boolean);
    demage: Demaged;
}

interface IShootable {
    bullets: Bullet[];
}

interface IDeleteable extends ImageXY {
    isDelete: boolean;
}

interface ICharacter extends isAttackable, IShootable {
    
}

interface IEneme extends isAttackable, IDeleteable {

}

interface IScore extends IActor {

}

class TitleTextActor implements IActor {
    private readonly context: DrawingContext;
    private readonly texts: string;

    private fade: number = 0;


    constructor(context: DrawingContext, texts: string) {
        this.context = context;
        this.texts = texts;
    }

    public draw() {
        const c = this.context.crc;
        c.font = "bold 48px serif";
        c.textAlign = "center";
        c.fillStyle = "blue";

        c.globalAlpha = this.fade;
        c.fillText(this.texts, this.context.width / 2, this.context.height / 2);
        c.globalAlpha = 1;
    }

    public calc() {
        if (this.fade < 0.8) {
            this.fade += 0.005;
        }
    }
}

class FadeInActor implements IActor {
    private readonly context: DrawingContext;

    private fade: number = 1;

    constructor(context: DrawingContext) {
        this.context = context;
    }

    public draw() {
        const c = this.context.crc;

        if (this.fade > 0) {
            c.globalAlpha = this.fade;
            c.fillStyle = "black";
            c.fillRect(0, 0, this.context.width, this.context.height);
            c.globalAlpha = 1;
        }
    }

    public calc() {
        this.fade -= 0.005;
    }
}

class ScrolledBackActor implements IActor {
    private readonly context: DrawingContext;
    private readonly image: HTMLImageElement;
    private readonly speed: number;

    private x1: number;
    private x2: number;
    private x3: number;

    constructor(context: DrawingContext, imageFilename: string, speed: number) {
        this.context = context;

        this.image = new Image();
        this.image.src = imageFilename;

        this.speed = speed;

        this.setup();
    }

    private setup() {
        const ratio = (this.context.width / this.image.naturalWidth) < (this.context.height / this.image.naturalHeight) ?
            this.context.width / this.image.naturalWidth : this.context.height / this.image.naturalHeight;
        this.image.width = this.image.naturalWidth * ratio;
        this.image.height = this.image.naturalHeight * ratio;
        this.x1 = 0;
        this.x2 = this.image.width - 2;
        this.x3 = (this.image.width * 2) - 4;
    }

    public draw() {
        if (this.image.width == 0) {
            this.setup();
        }

        const c = this.context.crc;

        c.drawImage(this.image, this.x1, 0, this.image.width, this.image.height);
        c.drawImage(this.image, this.x2, 0, this.image.width, this.image.height);
        c.drawImage(this.image, this.x3, 0, this.image.width, this.image.height);
    }

    public calc(xSpeed) {
        // 가속시 배경도 빠르게 지나가게 만들려면 보완이 필요하다
        this.x1 -= this.speed; // * (xSpeed != 0 ? Math.abs(xSpeed) : 1);  
        this.x2 -= this.speed; // * (xSpeed != 0 ? Math.abs(xSpeed) : 1);
        this.x3 -= this.speed; // * (xSpeed != 0 ? Math.abs(xSpeed) : 1);

        if (this.x1 + this.image.width < 2) {
            this.x1 = 0;
            this.x2 = this.image.width - 2;
            this.x3 = (this.image.width * 2) - 4;
        }
    }
}

class EnemeActor implements IEneme {
    private readonly context: DrawingContext;
    private readonly speed: number;
    private ratio;
    private maxHealth: number;
    public health: number;
    public x: number;
    public y: number;
    public isDelete: boolean;
    private isScore: boolean;

    public image: HTMLImageElement;

    constructor(context: DrawingContext, imageFilename: string, speed: number, maxHealth: number, ratio = 1) {
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

    private setup() {
        this.image.width = (this.image.naturalWidth / 4) * this.ratio;
        this.image.height = (this.image.naturalHeight / 4) * this.ratio;

        this.x = this.context.width;
        this.y = (this.context.height - this.image.height) * Math.random();
    }

    public draw() {
        if (this.image.width == 0) {
            this.setup();
        }

        const c = this.context.crc;

        const widht = this.x + this.image.width / 5;
        const height = this.y - this.image.height / 4;
        const hp = this.image.width / 2;

        c.fillStyle = "black";
        c.fillRect(widht, height, hp, 10)

        c.fillStyle = "#ff4444";
        c.fillRect(widht, height, hp * (this.health / this.maxHealth), 10)
        c.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
    }

    public calc() {
        this.x -= this.speed;

        if (this.image && this.x + this.image.width <= 0) {
            this.isDelete = true;
        }
    }
    public attack(isAttack: boolean) {

    }
    public demage = (x: number, y: number) => {
        let xCheck = this.x - (this.image.width * 1.5 / this.ratio) <= x && x <= this.x + (this.image.width / 2 / this.ratio);
        let yCheck = this.y - (this.image.height / 2 / this.ratio) <= y && y <= this.y + (this.image.height / 2);

        if (xCheck && yCheck) {
            this.health--
        }

        if (this.health <= 0) {
            this.isDelete = true;
            
            if(!this.isScore) {
                total += 1;
                this.isScore = true;
            }
        }
        return 0;
    }
}

class CharacterActor implements ICharacter {
    private readonly context: DrawingContext;
    private readonly speed: number;
    private readonly image: HTMLImageElement;
    private readonly imageFilenames: ImageFileNames;
    private readonly bulletImage: HTMLImageElement;

    public health: number;
    public bullets: Bullet[];

    private x: number;
    private y: number;

    constructor(context: DrawingContext, imageFilenames: ImageFileNames, speed: number) {
        this.context = context;
        this.imageFilenames = imageFilenames;
        this.speed = speed;

        this.image = new Image();
        this.image.src = this.imageFilenames["origin"];

        this.bullets = [];
        this.bulletImage = new Image()
        this.bulletImage.src = this.imageFilenames["attack"]

        this.setup();
    }

    private setup() {
        this.image.width = this.image.naturalWidth / 4;
        this.image.height = this.image.naturalHeight / 4;

        this.bulletImage.width = this.bulletImage.naturalWidth / 4;
        this.bulletImage.height = this.bulletImage.naturalHeight / 4;

        this.x = this.context.width / 4;
        this.y = this.context.height / 2;
    }

    public draw() {
        if (this.image.width == 0) {
            this.setup()
        }

        if (this.bulletImage.width == 0) {
            this.setup()
        }

        const c = this.context.crc;

        c.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);

        // console.log(this.score);
        if (this.bullets.length != 0) {
            for (const bullet of this.bullets) {
                c.drawImage(bullet.image, bullet.x + this.image.width, bullet.y + this.image.height / 2, bullet.image.width, bullet.image.height);
            }
        }
    }

    public calc(xSpeed: number, ySpeed: number, xPos: number, yPos: number) {
        if (xPos) this.x = xPos - this.image.width / 2;
        else this.x += this.speed * xSpeed;
        if (yPos) this.y = yPos - this.image.height / 2;
        else this.y += this.speed * ySpeed;

        // 영역
        if (this.y <= 0) {
            this.y = 0;
        } else if (this.y >= this.context.height - this.image.height) {
            this.y = this.context.height - this.image.height;
        }

        if (this.x <= 0) {
            this.x = 0;
        } else if (this.x >= this.context.width - this.image.width) {
            this.x = this.context.width - this.image.width;
        }

        if (this.bullets.length != 0) {
            for (const bullet of this.bullets) {
                bullet.x += bullet.speed;

                // 화면 나가면 삭제
                if (bullet.x >= this.context.width - bullet.image.width) {
                    bullet.isDelete = true;
                }
            }

            deleteObjet(this.bullets, "isDelete")
        }
    }

    public attack(isAttack: boolean) {
        if (isAttack) {
            this.bullets.push(new BulletActor(this.bulletImage, 20, this.x, this.y));
        }
    }

    public demage(x: number, y: number, xLimit: number, yLimit: number) {

    }
}

class BulletActor implements Bullet {
    public image: HTMLImageElement;
    public speed: number;
    public x: number;
    public y: number;
    public isDelete: boolean;

    constructor(image: HTMLImageElement, speed: number, x: number, y: number) {
        this.image = image;
        this.speed = speed;
        this.x = x;
        this.y = y;
        this.isDelete = false;
    }

    public demage = (x: number, y: number, xLimit: number, yLimit: number, ratio: number) => {
        let xCheck = this.x - (xLimit / 2 / ratio) <= x && x <= this.x + (xLimit * 1.5 / ratio);
        let yCheck = this.y - (yLimit / 2) <= y && y <= this.y + (yLimit / 2 / ratio);
        if (xCheck && yCheck) {
            // console.log("총알")
            this.isDelete = true;
        }
    }
}

class ScoreActor implements IScore {
    private readonly context: DrawingContext;

    private start: Date
    private then: Date
    private width: number;
    private height: number;

    constructor(context: DrawingContext) {
        this.context = context;
        total = 0;
        this.start = new Date();
        this.then = new Date();
        this.width = this.context.width / 10;
        this.height = this.context.height / 10;
    }

    public draw() {
        this.then = new Date();
        const c = this.context.crc;
        let time = new Date(this.then.getTime() - this.start.getTime());
        let text = (time.getMinutes() <= 9 ? "0" : "") + time.getMinutes() + ":" + (time.getSeconds() <= 9 ? "0" : "") + time.getSeconds()

        c.fillStyle = "purple";
        c.fillRect(0, 0, this.width + 60, this.height + 30)

        c.font = "bold 24px serif";
        c.fillStyle = "white";
        c.textAlign = "right";
        c.fillText(total.toString(), this.width + 40, this.height, this.width + 60);
        c.fillText(text, this.width + 40, this.height - 30, this.width + 60);

        c.textAlign = "left";
        c.fillText("시간:", 20, this.height - 30, this.width + 60);
        c.fillText("점수:", 20, this.height, this.width + 60);
        c.globalAlpha = 1;
    }

    public calc(xSpeed?: number, ySpeed?: number) {

    }
}

// 제네릭을 이용해 받은 key가 true이거나 받은 value와 같으면 해당되는 obj를 삭제히는 함수
function deleteObjet<Type, Key extends keyof Type, Value> (objs: Type[], key: Key, value?: Value) {
    for (const obj of objs) {
        let check: boolean = !!obj[key];

        if (value != undefined && typeof obj[key] == typeof value)
            check = obj[key] as unknown == value;

        //console.log("실행")
        if (check) {
            // 필터를 통해 현재 값과 같은 obj만 골라내고
            // indexof와 splice를 통해 삭제
            objs.splice(objs.indexOf(objs.filter((item: Type) => {
                if (item[key] == obj[key]) {
                    //console.log("삭제")
                    return true;
                }
                return false
            })[0]), 1);
        }
    }
}

type ImageFileNames = {
    [name: string]: string;
}

type Keys = {
    [index: string]: boolean;
}

type TouchPos = {
    x: number;
    y: number;
}

type Input = {
    xSpeed: number;
    ySpeed: number;
    isAttack: boolean;
}

type ImageXY = {
    image: HTMLImageElement;
    x: number;
    y: number;
}

type Bullet = ImageXY & {
    speed: number;
    demage: Demaged;
    isDelete: boolean;
}

type Demaged = (x: number, y: number, xLimit?: number, yLimit?: number, ratio?: number) => void | number;


type DrawingContext = {
    width: number,
    height: number
    crc: CanvasRenderingContext2D,
};