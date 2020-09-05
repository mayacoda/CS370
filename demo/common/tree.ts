import {GameObject} from "../../engine-lib";

export async function createTree(): Promise<GameObject> {
    const tree = new GameObject();

    await tree.loadObj('models/tree.obj', 'models/tree.mtl');
    await tree.loadTransparentTexture('models/Fern_Base_Color.png');

    return tree;
}
