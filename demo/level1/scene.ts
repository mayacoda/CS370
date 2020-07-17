import {GameObject, GameScene, Light, LightType} from "../../engine-lib/data";
import {randomRange} from "../../engine-lib/utilities";
import * as THREE from "three";
import {createAppleTree} from "./appleTree";

export async function loadObjects(scene: GameScene) {
    for (let i = 0; i < 20; i++) {
        const flowerObject = new GameObject()

        await flowerObject.loadObj('models/Flower.obj', 'materials/Flower.mtl')
        flowerObject.castShadow()
        let x = randomRange(-5, 5);
        let z = randomRange(-6, 0);
        flowerObject.translate(scene.convertToTerrainPoint(x, z));

        flowerObject.onUpdate(() => {
            flowerObject.rotate(new THREE.Vector3(0, 0.01, 0))
        })

        scene.addObject(flowerObject)
    }

    // const hedge = new GameObject()
    // await hedge.loadObj('models/hedge.obj', 'materials/hedge.mtl')
    // scene.addObject(hedge)

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
    ambientLight.setColor('#61b8bf')
    ambientLight.setIntensity(0.3)

    scene.addObject(ambientLight)

    const directionalLight = new Light(LightType.DirectionalLight);
    directionalLight.setColor('#faa78b')
    directionalLight.setIntensity(0.3)
    // directionalLight.createHelper()
    directionalLight.translate(0, 5, 0)
    directionalLight.object3D.castShadow = true;

    scene.addObject(directionalLight)
}
