import {GameScene} from "../../engine-lib/data";
import {AnimatedGameObject} from "../../engine-lib/data/AnimatedGameObject";
import {GameInput} from "../../engine-lib/data/GameInput";

enum DogState {
    running = 'Dog Armature|running',
    walking = 'Dog Armature|walk',
    idle = 'Dog Armature|idle',
    sitting = 'Dog Armature|sitting'
}

export async function loadCharacter(scene: GameScene) {
    const dog = new AnimatedGameObject();
    await dog.loadFBX('models/api/Api.fbx');
    dog.object3D.name = 'Main Character'

    dog.scale(2);
    dog.translate(scene.convertWorldPointToTerrainPoint(3, -4));
    dog.rotate(0, Math.PI - Math.PI / 4, 0);
    dog.castShadow(true)

    let state: DogState = DogState.idle;
    dog.setTimeScale(DogState.running, 2);
    dog.setTimeScale(DogState.walking, 3);
    dog.playAnimation(state);

    dog.onUpdate(() => {
        if (GameInput.KeyBoardInput === null && state !== DogState.idle) {
            dog.crossFadeAnimationImmediate(state, DogState.idle);
            state = DogState.idle;
            return;
        }

        if (GameInput.isKeyPressed('KeyW')) {
            if (GameInput.KeyBoardInput?.shiftKey) {
                if (state === DogState.idle) {
                    dog.crossFadeAnimationImmediate(DogState.idle, DogState.running);
                } else if (state === DogState.walking) {
                    dog.crossFadeAnimation(DogState.walking, DogState.running, .5);
                }

                state = DogState.running

            } else {
                if (state === DogState.idle) {
                    dog.crossFadeAnimationImmediate(DogState.idle, DogState.walking);
                } else if (state === DogState.running) {
                    dog.crossFadeAnimation(DogState.running, DogState.walking, 1.5);
                }

                state = DogState.walking
            }

            const elevation = scene.convertWorldPointToTerrainPoint(dog.position.x, dog.position.z).y - dog.position.y;
            dog.translate(0, elevation, getSpeed(state, dog));
        }

        if (GameInput.isKeyPressed('KeyA')) {
            dog.rotate(0, .06, 0);
        }

        if (GameInput.isKeyPressed('KeyD')) {
            dog.rotate(0, -.06, 0);
        }
    })

    scene.addObject(dog);

    return dog;
}

function getSpeed(state: DogState, dog: AnimatedGameObject) {
    const runningWeight = dog.getWeight(DogState.running);
    return Math.max(.4 * runningWeight, .1);
}
