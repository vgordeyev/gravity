// import * as readline from "readline";

class Coord3d {

    constructor(
        public x: number,
        public y: number,
        public z: number,
    ) {}

    vectorTo(to: Coord3d): Coord3d {
        return new Coord3d(to.x - this.x, to.y - this.y, to.z - this.z);
    }

    vectorSize(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    direction(to: Coord3d): Coord3d {
        const vector: Coord3d = this.vectorTo(to);
        const distance: number = vector.vectorSize();
        return new Coord3d(vector.x / distance, vector.y / distance, vector.z / distance);
    }

    mul(m: number): Coord3d {
        return new Coord3d(this.x * m, this.y * m, this.z * m);
    }

    div(m: number): Coord3d {
        return new Coord3d(this.x / m, this.y / m, this.z / m);
    }

    add(m: Coord3d): Coord3d {
        return new Coord3d(this.x + m.x,this.y + m.y, this.z + m.z);
    }
};

class PhysicalObject {

    constructor(
        public name: string,
        public color: string,
        public mass: number,
        public position: Coord3d,
        public speed: Coord3d,
    ) {}

    gravities: Coord3d[] = [];

    gravitySum(): Coord3d {
        const grSum: Coord3d = this.gravities.reduce(function (p, c, i, a) {
            return p.add(c);
        });
        return grSum;
    }

    acceleration(): Coord3d {
        return this.gravitySum().div(this.mass);
    }

    move(t: number) {
        var track = this.speed.mul(t).add(this.acceleration().mul(t * t).div(2));
        this.position = this.position.add(track);
        var speedDelta = this.acceleration().mul(t);
        this.speed = this.speed.add(speedDelta);
    }
}


function university(system: PhysicalObject[]): () => void {

    function updateSystemState(objects: PhysicalObject[]): void { // todo: bind arguments ???

        for (let obj of objects) {
            obj.gravities = [];
        }

        const G: number = +"6.67e-11";

        for (let one of objects) {
            for (let another of objects) {
                if (one !== another) {
                    const vector: Coord3d = one.position.vectorTo(another.position);
                    const distance: number = vector.vectorSize();
                    const direction: Coord3d = one.position.direction(another.position);
                    const gravity: number = G * one.mass * another.mass / (distance * distance);
                    const gravityVector: Coord3d = direction.mul(gravity);
                    // const gravityValue = gravityVector.vectorSize();
                    one.gravities.push(gravityVector);
                    // console.log("This: " + JSON.stringify(one));
                    // console.log("Other: " + JSON.stringify(another));
                    // console.log("Distance: " + distance + ", Gravity value: " + gravityValue);
                    // console.log("Vector: " + JSON.stringify(vector));
                    // console.log("Direction: " + JSON.stringify(direction));
                    // console.log("GravityVector: "+ JSON.stringify(gravityVector) + ", gravityValue: " + gravityValue + " \n");
                    // console.log("\n");
                }
            }
        }
    }

    function simulatePeriod(objects: PhysicalObject[], tacts: number, interval: number) { // todo: bind arguments ???
        for (let i = 0; i < tacts; i++) {
            updateSystemState(objects);
            for (let obj of objects) {
                obj.move(interval);
            }
        }
    }

    const INTERVAL: number = 1;
    let age = 0;


    const TACTS: number = 1000;
    function cycle(): void {

        console.log("\n\nAge: " + age);

        simulatePeriod(system, TACTS, INTERVAL);

        for (let one of system) {
            console.log("\n");
            // console.log(JSON.stringify(one));
            console.log("Name:     " + one.name);
            console.log("Position:     " + JSON.stringify(one.position));
            console.log("Speed:        " + JSON.stringify(one.speed));
            console.log("Acceleration: " + JSON.stringify(one.acceleration()));
            console.log("Gravity:      " + JSON.stringify(one.gravitySum()));
        }
        age += TACTS * INTERVAL;
    }

    return cycle;
}


function sky(system: PhysicalObject[]): (erase: boolean) => void {


    let world: HTMLCanvasElement | null = document.getElementById("space") as HTMLCanvasElement;

    let context: CanvasRenderingContext2D | null = world?.getContext('2d');

    const PADDING: number = 10;
    const SIDE: number = 700;
    const UNIVERSITY: Coord3d = new Coord3d(1200, 1200, 1200);
    const SKY_COLOR: string = 'lightblue';
    const SCALING: Coord3d = UNIVERSITY.div(SIDE);

    if (context) {
        context.fillStyle = SKY_COLOR;
        context.fillRect(PADDING, PADDING, SIDE, SIDE);
    }

    function drawObject(obj: PhysicalObject, erase?: boolean): void {

        if (!context) {
            return;
        }

        const x: number = PADDING + SIDE/2 + obj.position.x / SCALING.x;
        const y: number = PADDING + SIDE/2 - obj.position.y / SCALING.y;

        context.fillStyle = erase ? SKY_COLOR : obj.color;
        context.fillRect(erase ? x - 1 : x, erase ? y - 1 : y, erase ? 5 : 3, erase ? 5 : 3);
        if (erase) {
            context.fillStyle = "gray";
            context.fillRect(x, y, 3, 3);
        }
    }

    function draw(erase?: boolean): void {
        if (!context) {
            return;
        }

        for (let obj of system) {
            drawObject(obj, erase);
        }

    }

    return draw;
}


console.log('Hello there!');

let objects: PhysicalObject[] = [
    new PhysicalObject("Big", "red", 50000, new Coord3d(0, 100, 0), new Coord3d(-0.002, 0, 0)),
    new PhysicalObject("Small", "green", 5000, new Coord3d(150, 0, 0), new Coord3d(0, 0.001, 0)),
    new PhysicalObject("Main", "yellow", 5000000, new Coord3d(0, 0, 0), new Coord3d(0, 0, 0)),
];

const epoch = university(objects);
const view = sky(objects);

const PAUSE: number = 100;
/*var intervalId =*/ setInterval(function() {
    view(true);
    epoch();
    view(false);
}, PAUSE);



//
// var rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });
//
// function timeMgm(tacts: number) {
//     if (tacts === 0) {
//         updateSystemState(system);
//     }
//     else {
//         simulatePeriod(system, tacts, INTERVAL);
//     }
//     age += tacts;
//     // console.log("\n\n Age: " + age + " intervals by " + INTERVAL + " secs");
//
//     for (let one of system) {
//         console.log("\n");
//         // console.log(JSON.stringify(one));
//         console.log("Position:     " + JSON.stringify(one.position));
//         console.log("Speed:        " + JSON.stringify(one.speed));
//         console.log("Acceleration: " + JSON.stringify(one.acceleration()));
//         console.log("Gravity:      " + JSON.stringify(one.gravitySum()));
//     }
//
//     console.log("\n");
//     rl.question("\n\n Age: " + age + " intervals by " + INTERVAL + " secs " + INTERVAL + " sec): \n",
//         function (answer: string): void {
//                     if (answer === "stop") {
//                         rl.close();
//                         console.log("stopping\n");
//                         process.exit();
//                         // } else if (isNaN(Number(answer))) {
//                         //     timeMgm(Number(tacts));
//                     }
//                     else {
//                         // console.log("\n" + answer);
//                         const nextTacts: number = Number(answer) || tacts;
//                         // console.log("\n" + nextTacts);
//                         timeMgm(nextTacts);
//                     }
//                 });
// };
//
// console.log("Start.\n");
// timeMgm(0);
