import {GameScene} from "../../engine-lib/data";
import {AnimatedGameObject} from "../../engine-lib/data/AnimatedGameObject";
import {GameInput} from "../../engine-lib/data/GameInput";

enum DogState {
    running,
    walking,
    idle,
    sitting
}

export async function loadCharacter(scene: GameScene) {

    const dog = new AnimatedGameObject();
    await dog.loadFBX('models/api/Api.fbx');

    dog.scale(2);
    dog.translate(scene.convertWorldPointToTerrainPoint(3, -4));
    dog.rotate(0, Math.PI - Math.PI / 4, 0);
    dog.castShadow(true)

    dog.playAnimation('Dog Armature|idle');

    let state:DogState = DogState.idle

    dog.onUpdate(() => {
        if (GameInput.isKeyPressed('w')) {
            const elevation = scene.convertWorldPointToTerrainPoint(dog.position.x, dog.position.z).y - dog.position.y;
            dog.translate(0, elevation, .02);
            dog.playAnimation('Dog Armature|walk')
            dog.setTimeScale('Dog Armature|walk', 2)

            if (GameInput.KeyBoardInput?.shiftKey) {
                dog.crossFadeAnimation('Dog Armature|walk', 'Dog Armature|running', 3.5);
            } else {
                dog.crossFadeAnimation('Dog Armature|running', 'Dog Armature|walk', 3.5);
            }
        }

        if (GameInput.isKeyPressed('a')) {
            dog.rotate(0, .06, 0);
        }

        if (GameInput.isKeyPressed('d')) {
            dog.rotate(0, -.06, 0);
        }

        if (GameInput.KeyBoardInput === null) {
            dog.stopAnimation('Dog Armature|walk')
            dog.playAnimation('Dog Armature|idle')
        }
    })

    scene.addObject(dog);
}
