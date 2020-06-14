import {Game, GameObject, GameScene} from "../../engine-lib";
import * as THREE from "three";

function getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export async function loadLevel1(game: Game) {
    const scene = new GameScene();

    game.addScene(scene, 'level 1')

    for (let i = 0; i < 20; i++) {
        const flowerObject = new GameObject()

        await flowerObject.loadObj('models/Flower.obj', 'materials/Flower.mtl')

        flowerObject.onStart(() => {
            flowerObject.translate(new THREE.Vector3(getRandomArbitrary(-5, 5), 0, getRandomArbitrary(-6, 0)));
        })

        flowerObject.onUpdate(() => {
            flowerObject.rotate(new THREE.Vector3(0, 0.01, 0))
        })

        scene.addObject(flowerObject)
    }

    const appleTree = new GameObject()

    await appleTree.loadObj('models/AppleTree.obj', 'materials/AppleTree.mtl');
    appleTree.onStart(() => {
        appleTree.translate(new THREE.Vector3(2, 0, -3))
    })
    scene.addObject(appleTree)

    const appleTree2 = new GameObject()

    await appleTree2.loadObj('models/AppleTree.obj', 'materials/AppleTree.mtl');
    appleTree2.onStart(() => {
        appleTree2.translate(new THREE.Vector3(-4, 0, -5))
    })
    scene.addObject(appleTree2)
}
