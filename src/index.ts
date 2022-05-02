
import {Coord3d, PhysicalObject, universe} from './model.js';

interface ObservatorySettings {
    OBSERVABLE_AREA_SIDE: number;
    VIEWPOINT: Coord3d;
    SKY_COLOR: string;
    traceColor?: string;
};

function pourSky(color: string) {

    const world: HTMLCanvasElement | null = document.getElementById("space") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D | null = world?.getContext('2d');

    const SCREEN_SIDE: number = world.width;

    if (context) {
        context.fillStyle = color;
        context.fillRect(0, 0, SCREEN_SIDE, SCREEN_SIDE);
    }
}

function sky(system: PhysicalObject[], space: ObservatorySettings)
    : (erase?: boolean, redraw?: boolean) => void {


    const world: HTMLCanvasElement | null = document.getElementById("space") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D | null = world?.getContext('2d');
    const SCREEN_SIDE: number = world.width;

    if (context) {
        context.fillStyle = space.SKY_COLOR;
        context.fillRect(0, 0, SCREEN_SIDE, SCREEN_SIDE);
    }

    function drawObject(obj: PhysicalObject, erase?: boolean): void {

        if (!context) {
            return;
        }

        const x: number = Math.round(SCREEN_SIDE/2 + (obj.position.x - space.VIEWPOINT.x)/ space.OBSERVABLE_AREA_SIDE * SCREEN_SIDE);
        const y: number = Math.round(SCREEN_SIDE/2 - (obj.position.y - space.VIEWPOINT.y) / space.OBSERVABLE_AREA_SIDE * SCREEN_SIDE);

        if (!space.traceColor) {
            space.traceColor = space.SKY_COLOR;
        }

        context.fillStyle = erase ? space.traceColor : obj.color;
        context.fillRect(x,  y, 3, 3);
    }

    function draw(erase?: boolean, redraw?: boolean): void {
        if (!context) {
            return;
        }

        if (redraw) {
            context.fillStyle = space.SKY_COLOR;
            context.fillRect(0, 0, SCREEN_SIDE, SCREEN_SIDE);
        }

        for (let obj of system) {
            drawObject(obj, erase);
        }

    }

    return draw;
}


let objects: PhysicalObject[] = [
    new PhysicalObject("Small", "blue", 5000, new Coord3d(0, 333, 0), new Coord3d(-0.003, 0, 0)),
    new PhysicalObject("Medium", "green", 50000, new Coord3d(0, 330, 0), new Coord3d(-0.002,0, 0)),
    new PhysicalObject("Big", "red", 500000, new Coord3d(0, 300, 0), new Coord3d(-0.001, 0, 0)),
    new PhysicalObject("Main", "yellow", 5000000, new Coord3d(0, 0, 0), new Coord3d(0, 0, 0)),
];

const epoch = universe(objects);
const space: ObservatorySettings = {
    OBSERVABLE_AREA_SIDE: 700,
    VIEWPOINT: new Coord3d(0, 0, 0),
    SKY_COLOR: 'lightblue',
    traceColor: 'lightgray'
};
const view = sky(objects, space);

function delay(milliseconds: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}

async function forever(pause: number) {

    let xView: number = 0;
    while(true) {
        space.VIEWPOINT = new Coord3d(xView, 0, 0);
        view(true, true);
        epoch();
        view(false);

        // xView += 10;

        await delay(pause);
    }
}

const PAUSE: number = 500;
forever(PAUSE);
