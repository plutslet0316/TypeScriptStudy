let total: number;
let xRatio: number;
let yRatio: number;
let isOver: boolean;

class DrawingApp {
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private readonly drawContext;
    private readonly fpsInterval: number;

    private backActors: IActor[] = [];
    private frontActors: IActor[] = [];
    private enemys: IEneme[] = [];
    private bossEnemy: IEneme[] = [];
    private charator: ICharacter;
    private score: IScore;

    private attackInterval: number = 100;
    private attackDelay: number = 100;
    private isBoss: boolean;
    private boss: boolean;

    private bossCount: number;
    private start: number;
    private then: number;
    private time: number = 0;

    private enemyInterval: number;
    private enemyDelay: number;

    private keys: Keys = {};
    private touchPos: TouchPos = { x: 0, y: 0 };
    private input: Input;


    constructor(canvas: HTMLCanvasElement, fps = 60) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.fpsInterval = 1000 / fps;

        this.drawContext = {
            width: canvas.width,
            height: canvas.height,
            crc: this.context
        };;

        this.init();
        this.newGame();
    }

    private init() {
        this.canvas.style.cursor = 'none';

        xRatio = 1280 / this.canvas.clientWidth;
        yRatio = 720 / this.canvas.clientHeight;

        //console.log(xRatio, yRatio);

        this.input = {
            xSpeed: 0,
            ySpeed: 0,
            isAttack: false,
        };

        // 키보드 누름 & 뗌
        window.addEventListener("keydown", (e: KeyboardEvent) => { this.keys[e.key] = true; }, false);
        window.addEventListener("keyup", (e: KeyboardEvent) => { this.keys[e.key] = false; }, false);
        window.addEventListener("keydown", (e) => { if (e.key == "r" || e.key == "R") this.newGame(); }, false); // 재시작


        // 마우스 & 터치 움직임 감지
        const moveEvent = (e: MouseEvent | TouchEvent) => {
            xRatio = 1280 / this.canvas.clientWidth;
            yRatio = 720 / this.canvas.clientHeight;

            if (e instanceof MouseEvent) {
                this.touchPos.x = e.clientX
                this.touchPos.y = e.clientY
            }
            else if (e instanceof TouchEvent) {
                this.touchPos.x = e.changedTouches[0].clientX
                this.touchPos.y = e.changedTouches[0].clientY
            }

            this.touchPos.x *= xRatio;
            this.touchPos.y *= yRatio;
        }

        // 마우스 공격
        this.canvas.addEventListener("mousedown", (e: MouseEvent) => { this.keys["Z"] = true; }, false);
        this.canvas.addEventListener("mouseup", (e: MouseEvent) => { this.keys["Z"] = false; }, false);

        // 마우스 움직임
        this.canvas.addEventListener("mousemove", moveEvent, false);
        this.canvas.addEventListener("mouseenter", moveEvent, false);
        this.canvas.addEventListener("mouseleave", (e: MouseEvent) => { this.touchPos.x = 0; this.touchPos.y = 0 }, false);


        // 터치시 공격 & 움직임
        this.canvas.addEventListener("touchstart", (e: TouchEvent) => { this.keys["Z"] = true; }, false);
        this.canvas.addEventListener("touchmove", moveEvent, false)
        this.canvas.addEventListener("touchend", (e: TouchEvent) => { this.keys["Z"] = false; this.touchPos.x = 0; this.touchPos.y = 0 }, false);
    }

    public newGame() {
        isOver = false;

        // 초기화
        this.charator = null;
        this.score = null;
        this.backActors = [];
        this.frontActors = [];
        this.enemys = [];
        this.bossEnemy = [];

        this.enemyInterval = 5000;
        this.enemyDelay = this.time;
        this.boss = false;
        this.isBoss = false;
        this.bossCount = 0;

        // 엑터 생성
        this.charator = new CharacterActor(this.drawContext, { "fly1": "assets/Fly1.png", "fly2": "assets/Fly2.png", "attack": "assets/Bullet.png" }, 10);
        this.score = new ScoreActor(this.drawContext);

        // this.actors.push(new ScrolledBackActor(drawContext, "assets/back1.png", 0.4));
        // this.actors.push(new ScrolledBackActor(drawContext, "assets/back2.png", 0.8));
        // this.actors.push(new ScrolledBackActor(drawContext, "assets/back3.png", 1.5));
        this.backActors.push(new ScrolledBackActor(this.drawContext, "assets/BG.png", 6));
        this.frontActors.push(this.charator);
        this.frontActors.push(this.score);
        this.frontActors.push(new FadeInActor(this.drawContext));
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
        this.time = timestamp;

        // 환경에 맞게 계산
        this.drawLoop(this.backActors);
        this.drawLoop(this.enemys);
        this.drawLoop(this.bossEnemy);
        this.drawLoop(this.frontActors);
        this.animLoop(timestamp, this.charator)
        this.animLoop(timestamp, ...this.enemys.concat(this.bossEnemy));

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

        if (!isOver) {
            // 항상 같은 속도로 계산
            for (let elapsed = timestamp - this.then;   // 지나간 시간 = 현재 시간 - then 으로 시작
                elapsed >= this.fpsInterval;            // 지나간 시간이 간격보다 높거나 같아질 때 까지 반복
                elapsed -= this.fpsInterval)            // 지나간 시간에서 간격만큼 빼고 다시 시작
            {
                this.then = timestamp - (elapsed % this.fpsInterval);

                // 엑터 계산
                this.calcLoop(this.backActors);
                this.calcLoop(this.enemys);
                this.calcLoop(this.bossEnemy);
                this.calcLoop(this.frontActors);

                // 데미지 계산
                this.damagedCheck(this.charator.bullets, this.enemys);
                this.damagedCheck(this.charator.bullets, this.bossEnemy);
                this.damagedCheck([this.charator,], this.enemys, true);
                this.damagedCheck([this.charator,], this.bossEnemy, true);

                if (this.charator.health <= 0) {
                    isOver = true;
                    this.frontActors.push(new RetryTextActor(this.drawContext, ["Game Over", "Press 'R' to retry"]));
                }
            }
        } else {
            this.calcLoop(this.frontActors);
        }

        // 공격
        let attackElapsed = timestamp - this.attackDelay;
        if (attackElapsed >= this.attackInterval) {
            this.attackDelay = timestamp - (attackElapsed % this.attackInterval);

            this.attackLoop(this.charator, this.input.isAttack);
        }

        // 보스 소환 / 50점마다 한 번씩 소환
        if (!this.boss && total / 50 >= this.bossCount + 1) {
            this.isBoss = true;
            this.bossCount++;
        }

        if (this.isBoss && !this.boss) {
            this.boss = true;
            this.bossEnemy.push(new EnemeActor(this.drawContext, { "rfly1": "assets/RFly1.png", "rfly2": "assets/RFly2.png" }, 0.5, 200, 5, 2));
        }

        if (this.bossEnemy.length == 0) {
            this.isBoss = false
            this.boss = false;
        }

        // 적 소환 / 보스 있으면 소환 중지
        if (!this.isBoss) {
            let enemyElapsed = timestamp - this.enemyDelay;
            if (enemyElapsed >= this.enemyInterval) {
                this.enemys.push(new EnemeActor(this.drawContext, { "rfly1": "assets/RFly1.png", "rfly2": "assets/RFly2.png" }, 5, 5));

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

    private animLoop(timestamp: number, ...actors: IAnimatable[]) {
        for (const actor of actors) {
            actor.anim(timestamp)
        }
    }

    private attackLoop(actor: isAttackable, isAttack: boolean) {
        actor.attack(isAttack);
    }
    // this.damagedCheck([this.charator], this.bossEnemy)


    private damagedCheck(selfs: DamageCheckType[], targets: DamageCheckType[], isOnlyTarget = false) {
        for (const target of targets) {
            for (const self of selfs) {
                self.damaged(
                    (self.x + self.image.width <= target.x || self.x >= target.x + target.image.width),
                    (self.y + self.image.height <= target.y || self.y >= target.y + target.image.height),
                    target.damage ? target.damage : 1)
                if (isOnlyTarget) continue;
                target.damaged(
                    (target.x + target.image.width <= self.x || target.x >= self.x + self.image.width),
                    (target.y + target.image.height <= self.y || target.y >= self.y + self.image.height),
                    self.damage ? self.damage : 1)
            }
        }
    }
}

type DamageCheckType = ImageXY & {
    damaged: Damaged,
    damage?: number,
    ratio?: number
}

interface IActor {
    draw();
    calc(xSpeed?: number, ySpeed?: number, xPos?: number, yPos?: number);
}

interface isAttackable extends IActor {
    health: number;
    attack(isAttack: boolean);
    damaged: Damaged;
}
interface IAnimatable {
    anim: (timestamp: number) => void;
}

interface IShootable {
    bullets: Bullet[];
}

interface IDeleteable extends ImageXY {
    isDelete: boolean;
}

interface ICharacter extends IAnimatable, isAttackable, IShootable, IDeleteable {

}

interface IEneme extends IAnimatable, isAttackable, IDeleteable {
    score: number;
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

class RetryTextActor implements IActor {
    private readonly context: DrawingContext;
    private readonly texts: string[];

    private fade: number = 0;


    constructor(context: DrawingContext, texts: string[]) {
        this.context = context;
        this.texts = texts;
    }

    public draw() {
        const c = this.context.crc;
        c.globalAlpha = this.fade;

        c.font = "bold 48px serif";
        c.textAlign = "center";
        c.fillStyle = "blue";
        c.fillText(this.texts[0], this.context.width / 2, this.context.height / 2);

        c.font = "bold 28px serif";
        c.textAlign = "center";
        c.fillStyle = "blue";
        c.fillText(this.texts[1], this.context.width / 2, this.context.height / 2 + 48);

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
    private readonly ratio;

    public score: number;

    private maxHealth: number;
    public health: number;

    private imageFileNames: ImageFileNames;
    public image: HTMLImageElement;

    public startTime: number;

    public isDelete: boolean;
    private isScore: boolean;

    public x: number;
    public y: number;

    constructor(context: DrawingContext, imageFileNames: ImageFileNames, speed: number, maxHealth: number, score = 1, ratio = 1) {
        this.context = context;
        this.speed = speed;
        this.ratio = ratio;
        this.maxHealth = maxHealth;
        this.health = this.maxHealth;
        this.score = score;
        this.isDelete = false;
        this.imageFileNames = imageFileNames;
        this.startTime = Date.now();
        this.image = new Image();
        this.image.src = imageFileNames["rfly1"];

        this.setup();
    }

    private setup() {
        this.image.width = (this.image.naturalWidth / 4) * this.ratio;
        this.image.height = (this.image.naturalHeight / 4) * this.ratio;

        this.x = this.context.width;
        this.y = (this.context.height - this.image.height - 200) * Math.random() + 100;
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
    public damaged = (xCheck: boolean, yCheck: boolean, damage: number) => {
        if (!(xCheck || yCheck)) {
            this.health -= damage;
        }

        if (this.health <= 0) {
            this.isDelete = true;

            if (!this.isScore) {
                total += this.score;
                this.isScore = true;
            }
        }
        return 0;
    }

    public anim = (timestamp: number) => {
        let no = (Math.round(timestamp / 50) % 2) + 1;
        this.image.src = this.imageFileNames[`rfly${no}`];
    }
}

class CharacterActor implements ICharacter {
    private readonly context: DrawingContext;
    private readonly speed: number;
    private readonly imageFileNames: ImageFileNames;

    public readonly image: HTMLImageElement;
    private readonly bulletImage: HTMLImageElement;

    private maxHealth: number;
    public health: number;

    public bullets: Bullet[];
    private damageDelay: number;
    private damageInterval: number;
    private start: number;
    private then: number;

    public isDelete: boolean;

    public x: number;
    public y: number;

    private isDamaged: boolean;

    constructor(context: DrawingContext, imageFileNames: ImageFileNames, speed: number) {
        this.context = context;
        this.imageFileNames = imageFileNames;

        this.maxHealth = 10;
        this.health = this.maxHealth;
        this.speed = speed;

        this.image = new Image();
        this.image.src = this.imageFileNames["fly1"];

        this.bullets = [];
        this.bulletImage = new Image()
        this.bulletImage.src = this.imageFileNames["attack"]

        this.damageDelay = 1000;
        this.damageInterval = 1000;

        this.start = Date.now();
        this.then = this.start;

        this.isDamaged = false;

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
        const c = this.context.crc;
        const widht = 0;
        const height = this.context.height - 60
        if (this.image.width == 0) {
            this.setup()
        }

        if (this.bulletImage.width == 0) {
            this.setup()
        }

        c.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);

        if (this.bullets.length != 0) {
            for (const bullet of this.bullets) {
                c.drawImage(bullet.image, bullet.x, bullet.y, bullet.image.width, bullet.image.height);
            }
        }

        c.fillStyle = "purple";
        c.fillRect(widht, height, 400, 60)

        c.font = "bold 24px serif";
        c.fillStyle = "white";
        c.textAlign = "right";
        c.fillText("체력", widht + 64, height + 40);

        c.fillStyle = "black";
        c.fillRect(widht + 80, height + 10, 300, 40)

        c.fillStyle = "#ff4444";
        c.fillRect(widht + 80, height + 10, 300 * (this.health / this.maxHealth), 40)
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
            this.bullets.push(new BulletActor(this.bulletImage, 20, 1, this.x + this.image.width, this.y + this.image.height / 2));
        }
    }

    public damaged = (xCheck: boolean, yCheck: boolean, damage: number) => {
        let timestamp = Date.now() - this.then
        let damageElapsed = timestamp - this.damageDelay

        if (damageElapsed > this.damageInterval) {
            this.isDamaged = false;
        }

        if (!(xCheck || yCheck)) {
            while (damageElapsed > this.damageInterval) {
                damageElapsed -= this.damageInterval;
                this.damageDelay = 1000;
                this.then = Date.now();
            }
            if (!this.isDamaged) {
                this.health -= damage;
                this.isDamaged = true;
                // console.log(this.health);
            }
        }
    }

    public anim = (timestamp: number) => {
        let no = (Math.round(timestamp / 50) % 2) + 1;
        this.image.src = this.imageFileNames[`fly${no}`];
    }
}

// 이걸 사용하면 동시에 처리할 수 있지만, 깜빡이는 현상이 발생한다.
/*
const animActer = {
    start: Date.now(),
    anim: (imageFileNames: ImageFileNames, name: string, delay: number, start: number) => {
        let timestamp = Date.now() - start
        let no = (Math.round(timestamp / delay) % 2) + 1;
        return imageFileNames[`${name}${no}`];
    },

}
*/
class BulletActor implements Bullet {
    public image: HTMLImageElement;
    public speed: number;
    public damage: number;
    public x: number;
    public y: number;
    public isDelete: boolean;

    constructor(image: HTMLImageElement, speed: number, damage: number, x: number, y: number) {
        this.image = image;
        this.speed = speed;
        this.damage = damage
        this.x = x;
        this.y = y;
        this.isDelete = false;
    }

    public damaged = (xCheck: boolean, yCheck: boolean, damage: number) => {
        if (!(xCheck || yCheck)) {
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
    private getNow() {
        this.then = new Date();
    }

    public draw() {
        if (!isOver) this.getNow();
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
function deleteObjet<Type, Key extends keyof Type, Value>(objs: Type[], key: Key, value?: Value) {
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
    damage: number;
    damaged: Damaged;
    isDelete: boolean;
}

type Damaged = (
    xCheck: boolean, yCheck: boolean, damage?: number, timestamp?: number
) => void | number;


type DrawingContext = {
    width: number,
    height: number
    crc: CanvasRenderingContext2D,
};