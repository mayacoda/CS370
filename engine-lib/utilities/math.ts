export function randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export type Vector3 = {x: number, y: number, z: number};
