import {GameObject, GameScene, Light, LightType} from "../../engine-lib/data";
import {randomRange} from "../../engine-lib/utilities";
import * as THREE from "three";
import {createAppleTree} from "./appleTree";

export async function loadObjects(scene: GameScene) {
    for (let i = 0; i < 20; i++) {
        const flowerObject = new GameObject()

        await flowerObject.loadObj('models/Flower.obj', 'models/Flower.mtl')
        flowerObject.castShadow()
        let x = randomRange(-5, 5);
        let z = randomRange(-6, 0);
        flowerObject.translate(scene.convertToTerrainPoint(x, z));

        flowerObject.onUpdate(() => {
            flowerObject.rotate(new THREE.Vector3(0, 0.01, 0))
        })

        scene.addObject(flowerObject)
    }

    const fern = new GameObject();
    await fern.loadObj('models/fern.obj', 'models/fern.mtl');
    await fern.loadTexture('models/fern.png');
    fern.translate(scene.convertToTerrainPoint(2, 0.2, -3))
    scene.addObject(fern);

    await loadLampPosts(scene);

    const appleTree = await createAppleTree()
    appleTree.castShadow()
    const appleTree2 = await createAppleTree()
    appleTree2.castShadow()
    appleTree.translate(scene.convertToTerrainPoint(2, -0.2,0));
    appleTree2.translate(scene.convertToTerrainPoint(-4,  -0.2, -2));

    scene.addObject(appleTree)
    scene.addObject(appleTree2)

}

export function loadLights(scene: GameScene) {
    const ambientLight = new Light(LightType.AmbientLight);
    ambientLight.setColor('#ce74a3')
    ambientLight.setIntensity(0.1)

    scene.addObject(ambientLight)

    const directionalLight = new Light(LightType.DirectionalLight);
    directionalLight.setColor('#faa78b')
    directionalLight.setIntensity(0.3)
    // directionalLight.createHelper()
    directionalLight.translate(0, 5, 0)
    directionalLight.object3D.castShadow = true;

    scene.addObject(directionalLight)
}


async function loadLampPosts(scene: GameScene) {

    const lampPost = new GameObject();
    await lampPost.loadObj('models/lamp-post.obj', 'models/lamp-post.mtl');
    lampPost.setName('Lamp');
    lampPost.translate(scene.convertToTerrainPoint(2, -4));
    scene.addObject(lampPost)

    const light = new Light(LightType.PointLight);
    light.setColor('#f3caaa');
    light.setIntensity(0.2);
    light.createHelper();

    const lightContainer = new GameObject();
    lightContainer.addChild(light);

    light.translate(0, 3.75)
    lampPost.addChild(lightContainer)

    // const child = await lampPost.getMeshGroupByName('Glass_Cylinder')
    //
    // if (child) {
    //     child.layers.set(RenderLayers.UnrealBloom);
    // }
}
