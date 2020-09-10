import {Game, GameScene} from "../../engine-lib";
import {loadObjects} from "../common/scene";
import {loadCharacter} from "../common/character";
import {loadCamera} from "../common/camera";
import {initGamePlay, LEVEL_1_SCORE} from "./gameplay";
import {initGui, showInstructions} from "../common/gui";
import {loadLevel2} from "../level2/level2";
import {loadLights} from "./lights";
import {updateHighScore} from "../common/high-score";
import {LEVEL_1_SCENE_NAME} from "../common/levels";

export async function loadLevel1(game: Game) {
    const SCENE_NAME = LEVEL_1_SCENE_NAME;
    const scene = new GameScene(SCENE_NAME);

    game.addScene(scene)

    await scene.loadSkybox([
        'skybox/sunset/px.png',
        'skybox/sunset/nx.png',
        'skybox/sunset/py.png',
        'skybox/sunset/ny.png',
        'skybox/sunset/pz.png',
        'skybox/sunset/nz.png'
    ]);

    await scene.loadTerrain('HeightMap8.png', 'textures/Ground-Texture.png', {
        repeat: 20,
        color: '#888',
        maxHeight: 10,
        hasPhysics: true,
        widthExtents: 130,
        depthExtents: 130
    });

    scene.setFog('#845e5c', 0.03);
    await loadObjects(scene);
    const character = await loadCharacter(scene);

    loadCamera(scene, character);
    loadLights(scene);

    initGui(scene, {
        pausePlayCallback: state => {
            state ? game.pause() : game.play();
        },
        restartCallback: () => {
            game.startLoad();
            game.removeCurrentScene();
            music.stop();
            loadLevel1(game).then(() => {
                game.endLoad();
            })
        }
    });

    const audio = game.getAudio();

    const music  = await audio.loadSound('audio/Bohemian Beach - Chris Haugen.mp3', 'level_1_music');
    music.setLoop(true);
    music.setVolume(0.3);
    music.play();

    const text = [
        `
You're a dog. You play fetch. So let's fetch some balls!<br>
These special balls disappear when they stop moving, but they'll leave a trail for you to follow.<br>
Gather <strong>${LEVEL_1_SCORE}</strong> balls to proceed to the next level.
`,
        `
Turn using the <strong>A</strong> and <strong>D</strong> keys<br>
Move forward using the <strong>W</strong> key<br>
Run by holding down <strong>SHIFT</strong><br>
<br>
Rotate the camera with <strong>←</strong> and <strong>→</strong>
`,
        `Good luck!`
    ]

    showInstructions(scene, text, () => {
        initGamePlay(scene, character, (time: number) => {
            music.stop();

            updateHighScore(SCENE_NAME, time);

            game.startLoad();
            loadLevel2(game).then(() => {

                game.removeScene(SCENE_NAME);
                game.endLoad();
            });
        });
    });


    game.loadScene(SCENE_NAME);
}
