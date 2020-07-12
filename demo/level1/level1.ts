import {Game, GameObject, GameScene, Light, LightType, randomRange} from "../../engine-lib";
import * as THREE from "three";
import {createAppleTree} from "./appleTree";

export async function loadLevel1(game: Game) {
    const scene = new GameScene();

    game.addScene(scene, 'level 1')

    scene.loadSkybox('skybox/Epic_GloriousPink_EquiRect.png');

    // scene.loadSkybox([
    //     'skybox/CartoonBaseNightSky_Cam_2_Left+X.png',
    //     'skybox/CartoonBaseNightSky_Cam_3_Right-X.png',
    //     'skybox/CartoonBaseNightSky_Cam_4_Up+Y.png',
    //     'skybox/CartoonBaseNightSky_Cam_5_Down-Y.png',
    //     'skybox/CartoonBaseNightSky_Cam_0_Front+Z.png',
    //     'skybox/CartoonBaseNightSky_Cam_1_Back-Z.png'
    // ]);

    for (let i = 0; i < 20; i++) {
        const flowerObject = new GameObject()

        await flowerObject.loadObj('models/Flower.obj', 'materials/Flower.mtl')
        flowerObject.castShadow()
        flowerObject.translate(randomRange(-5, 5), 0, randomRange(-6, 0));

        flowerObject.onUpdate(() => {
            flowerObject.rotate(new THREE.Vector3(0, 0.01, 0))
        })

        scene.addObject(flowerObject)
    }

    const appleTree = await createAppleTree()
    appleTree.castShadow()
    const appleTree2 = await createAppleTree()
    appleTree2.castShadow()
    appleTree.translate(2, 0, 0);
    appleTree2.translate(-4, 0, -2)

    scene.addObject(appleTree)
    scene.addObject(appleTree2)

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
