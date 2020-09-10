import {GameObject, GameScene} from "../../engine-lib/data";
import {hideBall, launchBall, removeBall} from "../common/ball";
import {getExclamationText, showExclamation, writeNewScore} from "../common/gui";

export const LEVEL_1_SCORE = 10;
let score = 0;
let time = 0;
let interval: number | undefined;
const BALL_COLOR = '#c6c611';

let winCallback = (time: number) => {};

export async function initGamePlay(scene: GameScene, character: GameObject, onWin: (time: number) => void) {
    let {ball, hits} = await launchBall(scene, character.position, BALL_COLOR)
    ball.setName('ball' + score);

    winCallback = onWin;

    attachListener(ball);

    startTimer();

    async function relaunchBall() {
        const data = await launchBall(scene, character.position, BALL_COLOR);
        ball = data.ball;
        hits = data.hits;

        ball.setName('ball' + score);

        attachListener(ball);
    }

    function attachListener(ball: GameObject) {
        ball.onUpdate(() => {
            let rigidBody = ball.rigidBody;
            if (rigidBody && rigidBody.getLinearVelocity().length() < 0.01) {
                hideBall(ball);
            }

            if (ball.position.distanceTo(character.position) < 2) {
                incrementScore(scene);

                removeBall(ball, hits);
                relaunchBall();
            }

            if (Math.abs(ball.position.x) > 60 || Math.abs(ball.position.z) > 60 || ball.position.y < 0) {
                removeBall(ball, hits);
                showExclamation(scene, 'Ball out of bounds!<br>Throwing another')
                relaunchBall();
            }
        })
    }
}

function incrementScore(scene: GameScene) {
    score++;
    showExclamation(scene, getExclamationText(score, LEVEL_1_SCORE));
    writeNewScore(scene, score);

    if (score === LEVEL_1_SCORE) {
        winCallback(time);

        window.clearInterval(interval);
    }
}

function startTimer() {
    interval = window.setInterval(() => {
        time++;
    }, 1000)
}
