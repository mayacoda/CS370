import {GameObject} from "../../engine-lib";

export async function createTree(): Promise<GameObject> {
    const tree = new GameObject();

    tree.tag = 'tree';

    await tree.loadObj('models/tree.obj', 'models/tree.mtl');
    await tree.loadTransparentTexture('models/Fern_Base_Color.png');

    tree.onStart(() => {
        tree.createRigidBody({
            type: "cylinder",
            mass: 0,
            object: tree,
            height: 10,
            radius: tree.size.x,
            isStatic: true
        })
    })

    return tree;
}
