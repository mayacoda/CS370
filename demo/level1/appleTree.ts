import {GameObject, randomRange} from "../../engine-lib";

export async function createAppleTree(): Promise<GameObject> {
    const appleTree = new GameObject();

    await appleTree.loadObj('models/AppleTree.obj', 'models/AppleTree.mtl');

    for (let i = 0; i < 10; i++) {
        const apple = await createApple();

        apple.translate(randomRange(-1.2, 1.2), randomRange(2.5, 4.5), randomRange(-1.2, 1.2));
        appleTree.addChild(apple)
    }

    return appleTree;
}

export async function createApple(): Promise<GameObject> {
    const apple = new GameObject();
    await apple.loadObj('models/Apple.obj', 'models/Apple.mtl');
    return apple;
}
