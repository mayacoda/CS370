import {Game, GameScene} from "../../engine-lib/data";
import {loadCharacter} from "../common/character";
import {loadCamera} from "../common/camera";
import {loadLights} from "./lights";
import {loadObjects} from "../common/scene";
import {initGamePlay, LEVEL_2_SCORE, LEVEL_2_TIME_LIMIT} from "./gameplay";
import {restartGui, showInstructions} from "../common/gui";

export async function loadLevel2(game: Game) {
    const scene = new GameScene();

    const SCENE_NAME = 'level 2'
    game.addScene(SCENE_NAME, scene);

    await scene.loadSkybox([
        'skybox/green/px.png',
        'skybox/green/nx.png',
        'skybox/green/py.png',
        'skybox/green/ny.png',
        'skybox/green/pz.png',
        'skybox/green/nz.png'
    ]);

    await scene.loadTerrain('HeightMap9.png', 'textures/Ground-Texture2.png', {
        repeat: 20,
        color: '#888',
        maxHeight: 10,
        hasPhysics: true,
        widthExtents: 130,
        depthExtents: 130
    });

    scene.setFog('#4b816e', 0.03);

    const character = await loadCharacter(scene);

    loadCamera(scene, character);
    loadLights(scene);
    await loadObjects(scene);

    restartGui(scene);

    const text = [
        `
        Let's step it up a bit. Now there are <strong>TWO</strong> balls.<br>
        And a time limit.
        `,
        `
        You have <strong>${LEVEL_2_TIME_LIMIT} minutes</strong><br>
        to catch <strong>${LEVEL_2_SCORE} balls</strong>
        `,
        `GO!`
    ]
    showInstructions(scene, text, () => {
        initGamePlay(scene, character, () => {
            showInstructions(scene, ['Nice job! Have yourself a bone'], () => {})
        }, () => {
            showInstructions(scene, ['Game over, you didn\'t make it'], () => {})
        });
    });

    game.loadScene(SCENE_NAME);
}
