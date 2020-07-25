import {Game, GameScene} from "../../engine-lib";
import {loadLights, loadObjects} from "./scene";

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

    // await scene.loadSkybox('skybox/sunset/Skybox-equirect.png');

    await scene.loadTerrain('HeightMap8.png', 'textures/Ground-Texture.png', {repeat: 10, color: '#888'});

    scene.setFog('#845e5c', 0.03);
    await loadObjects(scene);
    loadLights(scene);
}
