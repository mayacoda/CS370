import {createElement} from "./gui-util";
import {GameScene} from "../../engine-lib/data";
import {showInstructions} from "./gui";
import {ServiceLocator} from "../../engine-lib/data/ServiceLocator";
import {GameStorage} from "../../engine-lib/data/GameStorage";
import {LEVEL_1_SCENE_NAME, LEVEL_2_SCENE_NAME} from "./levels";
import {formatTime} from "./high-score";

export function createHighScoreButton(scene: GameScene) {
    const element = createElement('high-score', 'button');
    element.innerHTML = 'hi score'
    element.addEventListener('click', () => {
        showHighScore(scene);
    })
    return element;
}

export function createPausePlayButton(pausePlayCallback: (state: boolean) => void) {
    const element = createElement('pause-play', 'button');
    element.innerHTML = 'pause';
    let state = false;
    element.addEventListener('click', () => {
        state = !state;
        element.innerHTML = state ? 'play' : 'pause';
        pausePlayCallback(state);
    });
    return element;
}

export function createRestartButton(restartCallback: () => void) {
    const element = createElement('restart', 'button');
    element.innerHTML = 'restart';
    element.addEventListener('click', () => {
       restartCallback();
    });
    return element;
}


export function showHighScore(scene: GameScene) {
    const storage = ServiceLocator.getService<GameStorage>('storage');

    const level1Item = storage.getItem(LEVEL_1_SCENE_NAME)
    const level1Score = level1Item ? formatTime(parseInt(level1Item)) : 'No Score'
    const level2Item = storage.getItem(LEVEL_2_SCENE_NAME)
    const level2Score = level2Item ? formatTime(parseInt(level2Item)) : 'No Score'

    const text = [
        `<h1>High Score</h1>
        <p>${LEVEL_1_SCENE_NAME}: ${level1Score}</p>
        <p>${LEVEL_2_SCENE_NAME}: ${level2Score}</p>`
    ]

    showInstructions(scene, text, () => {}, 'Close');
}
