import {GameObject, GameScene} from "../../engine-lib/data";
import {launchBall} from "./ball";
import * as THREE from 'three';

let score = 0;
let time = 0;
let interval;

export function initGamePlay(scene: GameScene, character: GameObject) {
    let {ball, hits} = launchBall(scene, character.position)

    attachListener(ball);

    incrementTime(scene);

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

                incrementScore(scene);

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

function incrementTime(scene: GameScene) {
    const timeElement = scene.getGUI().getElement('.time');

    interval = setInterval(() => {
        time++;
        timeElement.innerHTML = formatTime(time);
    }, 1000);
}

function removeBall(ball: GameObject, hits: GameObject[]) {
    hits.forEach(hit => hit.destroy());
    ball.destroy();
}

function incrementScore(scene: GameScene) {
    const exclamation = scene.getGUI().getElement('.exclamation');
    exclamation.innerHTML = 'Score!'
    setTimeout(() => {
        exclamation.innerHTML = ''
    }, 3000);

    const scoreElement = scene.getGUI().getElement('.score');
    score++;

    scoreElement.innerHTML = score.toString();
}

function formatTime(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0')
}
