import {Game, GameObject, GameScene} from "../../engine-lib/data";
import * as THREE from "three";

export async function loadLevel1(game: Game) {
    const scene = new GameScene();

    game.addScene(scene, 'level 1')

    const cubeGameObject = new GameObject()

    await cubeGameObject.loadModel('models/Flower.obj')

    cubeGameObject.onUpdate(() => {
        cubeGameObject.rotate(new THREE.Vector3(0.01, 0.02))
    })

    scene.addObject(cubeGameObject)
}
