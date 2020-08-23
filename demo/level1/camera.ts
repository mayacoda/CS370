import {GameObject, GameScene} from "../../engine-lib/data";
import {GameCamera} from "../../engine-lib/data/GameCamera";
import {GameInput, MouseButtons} from "../../engine-lib/data/GameInput";

export function loadCamera(scene: GameScene, character: GameObject) {

    const camera = new GameCamera('perspective');
    camera.lookAt(character);
    camera.follow(character, 0, 10, -10)

    let prevX: number | undefined;

    camera.onUpdate(() => {
        if (GameInput.MouseInput && GameInput.isMouseMoving && GameInput.isMouseButtonPressed(MouseButtons.Left)) {

            let clientX = GameInput.MouseInput.clientX;
            if (prevX === undefined) {
                prevX = clientX
                return;
            }

            const rotation = prevX > clientX ? 0.2 : -0.2;
            camera.rotate(0, rotation, 0);

            prevX = clientX;
        }

        if (!GameInput.isMouseButtonPressed(MouseButtons.Left)) {
            prevX = undefined;
        }

    })

    scene.addObject(camera);
}
