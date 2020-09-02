import {GameObject, GameScene} from "../../engine-lib/data";
import {GameCamera} from "../../engine-lib/data/GameCamera";
import {GameInput} from "../../engine-lib/data/GameInput";

export function loadCamera(scene: GameScene, character: GameObject) {

    const camera = new GameCamera('perspective');
    camera.lookAt(character);
    camera.follow(character, 0, 7, -20)

    camera.onUpdate(() => {
        if (GameInput.isKeyPressed('ArrowRight')) {
            camera.rotate(0, -0.1, 0);
        }

        if (GameInput.isKeyPressed('ArrowLeft')) {
            camera.rotate(0, 0.1, 0);
        }

        if (GameInput.isKeyPressed('KeyC')) {
            camera.rotation.copy(character.object3D.rotation);
        }
    })

    scene.addObject(camera);
}
