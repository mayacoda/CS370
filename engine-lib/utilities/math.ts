export function randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export function randomRangeInt(min: number, max: number) {
    return Math.floor(randomRange(min, max + 1))
}

export type Vector3 = {x: number, y: number, z: number};
