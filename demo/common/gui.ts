import {GameScene} from "../../engine-lib/data";
import {randomRangeInt} from "../../engine-lib/utilities";
import {LEVEL_1_SCORE} from "../level1/gameplay";

let timeout: number;

export function initGui(scene: GameScene) {
    const gui = scene.getGUI();
    gui.setDefaultGuiStyle('flex-direction: column;')

    const header = createElement('header');

    header.appendChild(createElement('time'));
    const scoreElement = createElement('score');
    header.appendChild(scoreElement);

    gui.addElement(header);
    gui.addElement(createElement('exclamation'))
}

export function showInstructions(scene: GameScene, text: string[], onFinish: () => void) {
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
    continueButton.textContent = 'Woof! Woof! (Continue)';
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

function createElement(className: string, elementTag: string = 'div') {
    const element = document.createElement(elementTag);
    element.classList.add(className);
    return element;
}

export function restartGui(scene: GameScene) {
    const gui = scene.getGUI();

    gui.getElement('.time').innerHTML = '';
    gui.getElement('.score').innerHTML = '';
}

export function showExclamation(scene: GameScene, text: string) {
    const exclamation = scene.getGUI().getElement('.exclamation');
    exclamation.innerHTML = text
    timeout = window.setTimeout(() => {
        if (timeout) window.clearTimeout(timeout);
        exclamation.innerHTML = ''
    }, 3000);
}

export function writeNewScore(scene: GameScene, score: number) {
    const scoreElement = scene.getGUI().getElement('.score');
    scoreElement.innerHTML = score.toString();
}

export function getExclamationText(score: number, maxScore: number) {
    if (score === Math.floor(maxScore / 2)) return 'Half way there!'
    if (score === LEVEL_1_SCORE - 1) return 'One more to go!'

    return ['Score!', 'Awesome!', 'Keep Going!'][randomRangeInt(0,2)]
}
