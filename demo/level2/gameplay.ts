import {GameObject, GameScene} from "../../engine-lib/data";
import {hideBall, launchBall, removeBall} from "../common/ball";
import {getExclamationText, showExclamation, writeNewScore} from "../common/gui";
import {randomRange} from "../../engine-lib/utilities";

let score = 0;
let time = 0;
let interval: number | undefined;

export const LEVEL_2_SCORE = 20;
export const LEVEL_2_TIME_LIMIT = 3;

let winCallback = () => {
};

let loseCallback = () => {
};

const BALL1_COLOR = '#9bff5e';
const BALL2_COLOR = '#0065ff'

export function initGamePlay(scene: GameScene, character: GameObject, onWin: () => void, onLose: () => void) {
    let data1 = launchBall(scene, character.position, BALL1_COLOR);
    data1.ball.setName('ball1');
    let data2 = launchBall(scene, character.position, BALL2_COLOR);
    data2.ball.setName('ball2');

    winCallback = onWin;
    loseCallback = onLose;

    incrementTime(scene);

    attachListener(data1);
    attachListener(data2);

    function relaunchBall() {
        const data = launchBall(scene, character.position, [BALL1_COLOR, BALL2_COLOR][Math.round(randomRange(0, 1))]);

        data.ball.setName('ball' + score);

        attachListener(data);
    }


    function attachListener(data: { ball: GameObject, hits: GameObject[] }) {
        data.ball.onUpdate(() => {
            let rigidBody = data.ball.rigidBody;
            if (rigidBody && rigidBody.getLinearVelocity().length() < 0.01) {
                hideBall(data.ball);
            }

            if (data.ball.position.distanceTo(character.position) < 2) {
                incrementScore(scene);

                removeBall(data.ball, data.hits);
                relaunchBall();
            }

            if (Math.abs(data.ball.position.x) > 60 || Math.abs(data.ball.position.z) > 60 || data.ball.position.y < 0) {
                removeBall(data.ball, data.hits);
                showExclamation(scene, 'Ball out of bounds!<br>Throwing another')
                relaunchBall();
            }
        })
    }
}

function incrementScore(scene: GameScene) {
    score++;
    showExclamation(scene, getExclamationText(score, LEVEL_2_SCORE));
    writeNewScore(scene, score);

    if (score === LEVEL_2_SCORE) {
        winCallback();
    }
}

function incrementTime(scene: GameScene) {
    const timeElement = scene.getGUI().getElement('.time');

    interval = window.setInterval(() => {
        time++;
        timeElement.innerHTML = formatTime(time);
    }, 1000);

    if (time > (LEVEL_2_TIME_LIMIT * 60)) {
        showExclamation(scene, 'Time is up!');
        window.clearInterval(interval);
        setTimeout(loseCallback, 3000);

    }
}

function formatTime(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0')
}
