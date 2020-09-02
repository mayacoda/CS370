import {Game, GameScene} from "../../engine-lib";
import {loadLights, loadObjects} from "./scene";
import {loadCharacter} from "./character";
import {loadCamera} from "./camera";
import {initGamePlay} from "./gameplay";

export async function loadLevel1(game: Game) {
    const scene = new GameScene();

    game.addScene(scene, 'level 1')

    await scene.loadSkybox([
        'skybox/sunset/px.png',
        'skybox/sunset/nx.png',
        'skybox/sunset/py.png',
        'skybox/sunset/ny.png',
        'skybox/sunset/pz.png',
        'skybox/sunset/nz.png'
    ]);

    // todo: fix equirect skybox implementation with version r119 of three
    // await scene.loadSkybox('skybox/sunset/Skybox-equirect.png');

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

    initGamePlay(scene, character);
}
