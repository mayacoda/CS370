import {GameObject, GameScene, Light, LightType} from "../../engine-lib/data";
import {randomRange} from "../../engine-lib/utilities";
import {createAppleTree} from "./appleTree";

export async function loadObjects(scene: GameScene) {
    for (let i = 0; i < 5; i++) {

        const fern = new GameObject();
        await fern.loadObj('models/fern.obj', 'models/fern.mtl');
        await fern.loadTransparentTexture('models/fern.png');


        fern.castShadow()
        let x = randomRange(-5, 5);
        let z = randomRange(-5, 5);
        fern.translate(scene.convertToTerrainPoint(x, 0.3, z));

        let scale = randomRange(2, 3);
        fern.scale(scale, scale, scale);

        const rotation = scene.getTerrainNormalAtPoint(x, z);
        if (rotation !== null) {
            fern.rotate(rotation)
        }

        scene.addObject(fern)
    }


    await loadLampPosts(scene);

    const appleTree = await createAppleTree()
    appleTree.castShadow()
    const appleTree2 = await createAppleTree()
    appleTree2.castShadow()
    appleTree.translate(scene.convertToTerrainPoint(5, -0.2,2));
    appleTree2.translate(scene.convertToTerrainPoint(-4,  -0.2, -2));

    scene.addObject(appleTree)
    scene.addObject(appleTree2)

}

export function loadLights(scene: GameScene) {
    const hemisphereLight = new Light(LightType.HemisphereLight);
    hemisphereLight.setColor('#1f6f4e', '#cc95f5')
    hemisphereLight.setIntensity(0.5)
    scene.addObject(hemisphereLight)

    const directionalLight = new Light(LightType.DirectionalLight);
    directionalLight.setColor('#faa78b')
    directionalLight.setIntensity(0.4)
    // directionalLight.createHelper()
    directionalLight.translate(0, 5, 0)
    directionalLight.object3D.castShadow = true;

    scene.addObject(directionalLight)
}


async function loadLampPosts(scene: GameScene) {

    const lampPost = new GameObject();
    await lampPost.loadObj('models/lamp-post.obj', 'models/lamp-post.mtl');
    lampPost.setName('Lamp');
    lampPost.translate(scene.convertToTerrainPoint(0, 0));
    scene.addObject(lampPost)

    const light = new Light(LightType.PointLight);
    light.object3D.castShadow = true;
    light.setColor('#f3caaa');
    light.setIntensity(.5);
    // light.createHelper();

    const lightContainer = new GameObject();
    lightContainer.addChild(light);

    light.translate(0, 3.75)
    lampPost.addChild(lightContainer)
}
