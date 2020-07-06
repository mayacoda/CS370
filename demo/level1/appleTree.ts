import {GameObject, Light, LightType, randomRange} from "../../engine-lib";

export async function createAppleTree(): Promise<GameObject> {
    const appleTree = new GameObject();

    await appleTree.loadObj('models/AppleTree.obj', 'materials/AppleTree.mtl');

    for (let i = 0; i < 10; i++) {
        const apple = await createApple();

        apple.translate(randomRange(-1.2, 1.2), randomRange(2.5, 4.5), randomRange(-1.2, 1.2));
        appleTree.addChild(apple)
    }

    const light = new Light(LightType.PointLight);
    light.setColor('#f3790e');
    light.setIntensity(0.2);
    // light.createHelper();

    const lightContainer = new GameObject();
    lightContainer.addChild(light);

    light.translate(randomRange(2, 3), 4)

    lightContainer.onUpdate(() => {
        lightContainer.rotate(0, 0.006, 0)
    })

    appleTree.addChild(lightContainer)

    return appleTree;
}

export async function createApple(): Promise<GameObject> {
    const apple = new GameObject();
    await apple.loadObj('models/Apple.obj', 'materials/Apple.mtl');
    return apple;
}
