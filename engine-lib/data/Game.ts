import {GameScene} from "./GameScene";
import {RenderEngine} from "./RenderEngine";
import {GameCycleEntity} from "./interfaces/GameCycleEntity";
import {ServiceLocator} from "./ServiceLocator";

export class Game extends GameCycleEntity {
    private currentScene = new GameScene();
    private scenes = new Map<string, GameScene>();
    private renderEngine: RenderEngine

    constructor(canvas: HTMLCanvasElement) {
        super();
        this.renderEngine = new RenderEngine(canvas, this)
    }

    addScene(scene: GameScene, sceneName: string) {
        if (this.scenes.has(sceneName)) {
            throw new Error(`scene ${sceneName} already exists in the game`)
        }

        this.scenes.set(sceneName, scene)
    }

    removeScene(sceneName: string) {
        if (!this.scenes.has(sceneName)) {
            throw new Error(`could not find and remove scene ${sceneName}`)
        }

        this.scenes.delete(sceneName)
    }

    loadScene(sceneName: string) {
        const toLoad = this.scenes.get(sceneName)

        if (!toLoad) {
            throw new Error(`could find and load scene ${sceneName}`)
        }

        this.currentScene = toLoad;
        this.currentScene.start();

        ServiceLocator.setService('scene', this.currentScene.getScene())
    }

    getCurrentScene(): GameScene {
        return this.currentScene;
    }

    start() {
        super.start();
        this.renderEngine.start();
    }

    update() {
        super.update();
        this.currentScene.update();
    }

    destroy() {
        super.destroy();
        this.currentScene.destroy();
    }
}
