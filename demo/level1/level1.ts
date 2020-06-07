import {Game, GameObject, GameScene} from "../../engine-lib/data";
import * as THREE from "three";

export async function loadLevel1(game: Game) {
    const scene = new GameScene();

    game.addScene(scene, 'level 1')

    let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    let material = new THREE.MeshNormalMaterial();

    const cubeGameObject = new GameObject()

    await cubeGameObject.loadModel('models/Apple.obj')

    cubeGameObject.onUpdate(() => {
        cubeGameObject.rotate(new THREE.Vector3(0.01, 0.02))
    })

    scene.addObject(cubeGameObject)
}
