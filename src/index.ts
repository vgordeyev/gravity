import * as readline from "readline";

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


function updateSystemState(objects: PhysicalObject[]): void {

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

function simulatePeriod(objects: PhysicalObject[], tacts: number, interval: number) {
    for (let i = 0; i < tacts; i++) {
        updateSystemState(objects);
        for (let obj of objects) {
            obj.move(interval);
        }
    }
}

console.log('Hello there!');


const INTERVAL: number = 1;
let age = 0;
let system: PhysicalObject[] = [
    // new PhysicalObject("Big", 1000000, new Coord3d(1000, 500, 0), new Coord3d(0, 0, 0)),
    new PhysicalObject("Small", 5000, new Coord3d(100, 0, 0), new Coord3d(0, 0.001, 0)),
    new PhysicalObject("Main", 5000000, new Coord3d(0, 0, 0), new Coord3d(0, 0, 0)),
];

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function timeMgm(tacts: number) {
    if (tacts === 0) {
        updateSystemState(system);
    }
    else {
        simulatePeriod(system, tacts, INTERVAL);
    }
    age += tacts;
    // console.log("\n\n Age: " + age + " intervals by " + INTERVAL + " secs");

    for (let one of system) {
        console.log("\n");
        // console.log(JSON.stringify(one));
        console.log("Position:     " + JSON.stringify(one.position));
        console.log("Speed:        " + JSON.stringify(one.speed));
        console.log("Acceleration: " + JSON.stringify(one.acceleration()));
        console.log("Gravity:      " + JSON.stringify(one.gravitySum()));
    }

    console.log("\n");
    rl.question("\n\n Age: " + age + " intervals by " + INTERVAL + " secs " + INTERVAL + " sec): \n",
        function (answer: string): void {
                    if (answer === "stop") {
                        rl.close();
                        console.log("stopping\n");
                        process.exit();
                        // } else if (isNaN(Number(answer))) {
                        //     timeMgm(Number(tacts));
                    }
                    else {
                        // console.log("\n" + answer);
                        const nextTacts: number = Number(answer) || tacts;
                        // console.log("\n" + nextTacts);
                        timeMgm(nextTacts);
                    }
                });
};

console.log("Start.\n");
timeMgm(0);
