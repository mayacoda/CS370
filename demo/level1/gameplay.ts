import {GameObject, GameScene} from "../../engine-lib/data";
import {launchBall} from "./ball";
import * as THREE from 'three';

export function initGamePlay(scene: GameScene, character: GameObject) {
    let {ball, hits} = launchBall(scene, character.position)

    attachListener(ball);

    function relaunchBall() {
        const data = launchBall(scene, character.position);
        ball = data.ball;
        hits = data.hits;

        attachListener(ball);
    }

    function attachListener(ball: GameObject) {
        ball.onUpdate(() => {
            let rigidBody = ball.rigidBody;
            if (rigidBody && rigidBody.getLinearVelocity().length() < 0.01) {
                if (ball.object3D instanceof THREE.Mesh) {
                    const material = ball.object3D.material as THREE.Material;
                    material.opacity = 0;
                }
            }

            if (ball.position.distanceTo(character.position) < 2) {
                if (ball.object3D instanceof THREE.Mesh) {
                    const material = ball.object3D.material as THREE.Material;
                    material.opacity = 1;
                }

                removeBall(ball, hits);
                relaunchBall();
            }

            if (Math.abs(ball.position.x) > 60 || Math.abs(ball.position.z) > 60 || ball.position.y < 0) {
                removeBall(ball, hits);
                relaunchBall();
            }
        })
    }
}

function removeBall(ball: GameObject, hits: GameObject[]) {
    hits.forEach(hit => hit.destroy());
    ball.destroy();
}
