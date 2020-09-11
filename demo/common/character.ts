import {GameScene} from "../../engine-lib/data";
import {AnimatedGameObject} from "../../engine-lib/data/AnimatedGameObject";
import {GameInput} from "../../engine-lib/data/GameInput";
import {GameState, ServiceLocator} from "../../engine-lib/data/ServiceLocator";
import {PhysicsEngine} from "../../engine-lib/data/PhysicsEngine";

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

    dog.tag = 'dog';

    dog.scale(2);
    dog.translate(scene.convertWorldPointToTerrainPoint(50, 50));
    dog.rotate(0, Math.PI + Math.PI / 4, 0);
    dog.castShadow(true)

    let state: DogState = DogState.idle;
    dog.setTimeScale(DogState.running, 2);
    dog.setTimeScale(DogState.walking, 3);
    dog.playAnimation(state);

    dog.onStart(() => {
        dog.createRigidBody({
            type: "sphere",
            radius: 3,
            object: dog,
            mass: 0,
            isKinematic: false,
            isDynamic: false,
            noContactResponse: false,
            isCharacter: true,
            isStatic: false
        });
    })

    dog.onUpdate(() => {
        const {debug} = ServiceLocator.getService<GameState>('gameState');

        if (debug) {
            const physics = ServiceLocator.getService<PhysicsEngine>('physics');
            physics.detectedCollisions.forEach(collision => {
                if (collision.isOfTags('dog', 'tree')) {
                    console.log('dog and tree');
                }

                if (collision.isOfTags('dog', 'ball')) {
                    console.log('dog and ball');
                }

                if (collision.isOfTags('dog', 'terrain')) {
                    console.log('dog and terrain');
                }
            })

        }

        if (!GameInput.isKeyPressed('KeyW') && state !== DogState.idle) {
            dog.crossFadeAnimationImmediate(state, DogState.idle);
            state = DogState.idle;
            return;
        }

        if (GameInput.isKeyPressed('KeyW')) {
            if (GameInput.KeyBoardInput?.shiftKey) {
                if (state === DogState.idle) {
                    dog.crossFadeAnimationImmediate(DogState.idle, DogState.running);
                } else if (state === DogState.walking) {
                    dog.crossFadeAnimation(DogState.walking, DogState.running, .25);
                }

                state = DogState.running

            } else {
                if (state === DogState.idle) {
                    dog.crossFadeAnimationImmediate(DogState.idle, DogState.walking);
                } else if (state === DogState.running) {
                    dog.crossFadeAnimation(DogState.running, DogState.walking, .5);
                }

                state = DogState.walking
            }

            const elevation = scene.convertWorldPointToTerrainPoint(dog.position.x, dog.position.z).y - dog.position.y;
            const speed = getSpeed(state, dog);
            dog.translate(0, elevation, speed);

            if (dog.position.x > 62 || dog.position.z > 62) {
                dog.translate(0, elevation, -speed);
            }
        }

        if (GameInput.isKeyPressed('KeyA')) {
            dog.rotate(0, .08, 0);
        }

        if (GameInput.isKeyPressed('KeyD')) {
            dog.rotate(0, -.08, 0);
        }
    })

    scene.addObject(dog);

    return dog;
}

function getSpeed(state: DogState, dog: AnimatedGameObject) {
    const runningWeight = dog.getWeight(DogState.running);
    return Math.max(.5 * runningWeight, .2);
}
