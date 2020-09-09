import {GameScene} from "../../engine-lib/data";
import {randomRangeInt} from "../../engine-lib/utilities";
import {createElement} from "./gui-util";
import {createHighScoreButton, createPausePlayButton, createRestartButton} from "./gui-footer";

let timeout: number;

export function initGui(scene: GameScene,
                        callbacks: { pausePlayCallback: (state: boolean) => void, restartCallback: () => void }) {
    const gui = scene.getGUI();
    gui.setDefaultGuiStyle('flex-direction: column; justify-content: space-between')

    const header = createElement('header');

    header.appendChild(createElement('time'));
    const scoreElement = createElement('score');
    header.appendChild(scoreElement);

    const {pausePlayCallback, restartCallback} = callbacks;

    const footer = createElement('footer');
    footer.appendChild(createHighScoreButton(scene))
    footer.appendChild(createPausePlayButton(pausePlayCallback))
    footer.appendChild(createRestartButton(restartCallback))

    gui.addElement(header);
    gui.addElement(createElement('exclamation'))
    gui.addElement(footer);
}

export function showInstructions(scene: GameScene, text: string[], onFinish: () => void, buttonText: string = 'Woof! Woof! (Continue)') {
    if (text.length === 0) {
        onFinish();
        return;
    }

    const gui = scene.getGUI();

    const overlay = createElement('full-screen-overlay');
    const instructions = createElement('instructions');
    const instructionsText = createElement('instructions-text', 'p');
    const continueButton = createElement('continue', 'button');

    overlay.classList.add('instructions-overlay');
    overlay.appendChild(instructions)
    instructions.appendChild(instructionsText);
    instructions.appendChild(continueButton)
    gui.addElement(overlay);

    instructionsText.innerHTML = text[0]

    let page = 0;
    continueButton.textContent = buttonText;
    continueButton.addEventListener('click', () => {
        page++;
        if (page >= text.length) {
            onFinish()
            gui.removeElement(overlay)
        } else {
            instructionsText.innerHTML = text[page];
        }
    })
}

export function restartGui(scene: GameScene) {
    const gui = scene.getGUI();

    gui.getElement('.time').innerHTML = '';
    gui.getElement('.score').innerHTML = '';
}

export function showExclamation(scene: GameScene, text: string) {
    const exclamation = scene.getGUI().getElement('.exclamation');
    exclamation.innerHTML = text
    if (timeout) window.clearTimeout(timeout);

    timeout = window.setTimeout(() => {
        exclamation.innerHTML = ''
    }, 3000);
}

export function writeNewScore(scene: GameScene, score: number) {
    const scoreElement = scene.getGUI().getElement('.score');
    scoreElement.innerHTML = score.toString();
}

export function getExclamationText(score: number, maxScore: number) {
    if (score === Math.floor(maxScore / 2)) return 'Half way there!'
    if (score === maxScore - 1) return 'One more to go!'

    return ['Score!', 'Awesome!', 'Keep Going!'][randomRangeInt(0,2)]
}
