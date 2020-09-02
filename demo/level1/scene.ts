import {GameObject, GameScene, Light, LightType} from "../../engine-lib/data";
import {randomRange} from "../../engine-lib/utilities";
import {createTree} from "./tree";

export async function loadObjects(scene: GameScene) {
    for (let i = 0; i < 40; i++) {

        const fern = new GameObject();
        await fern.loadObj('models/fern.obj', 'models/fern.mtl');
        await fern.loadTransparentTexture('models/Fern Base Color.png');

        fern.castShadow()
        let x = randomRange(-45, 45);
        let z = randomRange(-45, 45);
        fern.translate(scene.convertWorldPointToTerrainPoint(x, 0.3, z));

        let scale = randomRange(1, 5);
        fern.scale(scale, scale, scale);

        const rotation = scene.getTerrainNormalAtPoint(x, z);
        if (rotation !== null) {
            fern.object3D.up.copy(rotation);
        }

        scene.addObject(fern)
    }


    for (let i = 0; i < 20; i++) {

        const tree = await createTree();

        tree.castShadow()
        let x = randomRange(-45, 45);
        let z = randomRange(-45, 45);
        tree.translate(scene.convertWorldPointToTerrainPoint(x, -0.2, z));

        let scale = randomRange(0.3, 1.7);
        tree.scale(scale, scale, scale);

        const rotation = scene.getTerrainNormalAtPoint(x, z);
        if (rotation !== null) {
            tree.object3D.up.copy(rotation);
        }

        tree.rotate(0, randomRange(-Math.PI, Math.PI), 0);

        scene.addObject(tree)
    }

    await loadLampPosts(scene);
}

export function loadLights(scene: GameScene) {
    const hemisphereLight = new Light(LightType.HemisphereLight);
    hemisphereLight.setColor('#209467', '#be804a')
    hemisphereLight.setIntensity(0.5)
    scene.addObject(hemisphereLight)

    const directionalLight = new Light(LightType.DirectionalLight);
    directionalLight.setColor('#faa78b')
    directionalLight.setIntensity(0.5)
    directionalLight.translate(0, 20, 0)
    directionalLight.object3D.castShadow = true;

    scene.addObject(directionalLight)
}

async function loadLampPosts(scene: GameScene) {

    const lampConfig = [
        [0, 0],
        [10, 20],
        [14, 10],
        [35, 50]
    ]

    for (let i = 0; i < lampConfig.length; i++){
        let [x, z] = lampConfig[i];
        const lampPost = new GameObject();
        await lampPost.loadObj('models/lamp-post.obj', 'models/lamp-post.mtl');
        lampPost.setName(`Lamp${i}`);
        lampPost.translate(scene.convertWorldPointToTerrainPoint(x, z));
        scene.addObject(lampPost)

        const light = new Light(LightType.PointLight);
        // light.object3D.castShadow = true;
        light.setColor('#dd9151');
        light.setIntensity(.5);

        const lightContainer = new GameObject();
        lightContainer.addChild(light);

        light.translate(0, 3.75);
        lampPost.addChild(lightContainer);
    }


}
