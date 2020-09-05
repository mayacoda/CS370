import {GameObject} from "../../engine-lib/data";

export async function createFern() {
    const fern = new GameObject();
    await fern.loadObj('models/fern.obj', 'models/fern.mtl');
    await fern.loadTransparentTexture('models/Fern Base Color.png');

    return fern;
}
