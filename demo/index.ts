import {Game} from "../engine-lib/data";
import {loadLevel1} from "./level1";

async function init() {
    // fetch the canvas element
    let canvas = document.querySelector('#canvas');
    if (canvas === null || !(canvas instanceof HTMLCanvasElement)) return

    // start the game
    const game = new Game(canvas);
    await game.preload()

    // load the first level
    await loadLevel1(game);

    // set current scene to first level
    game.loadScene( 'level 1');
    game.start();
}

init().then(() => {
    const loader = document.querySelector('.loading') as HTMLElement;
    loader.style.opacity = '0';
    console.log('Game is ready')
})
