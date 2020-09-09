import {GameScene} from "./GameScene";
import {RenderEngine} from "./RenderEngine";
import {GameCycleEntity} from "./GameCycleEntity";
import {GameState, ServiceLocator} from "./ServiceLocator";
import {PhysicsEngine} from "./PhysicsEngine";
import {Cache} from 'three';
import {GameStorage} from "./GameStorage";

Cache.enabled = true;

export class Game extends GameCycleEntity {
    private currentScene: GameScene | null = null;
    private scenes = new Map<string, GameScene>();
    private renderEngine: RenderEngine
    private physicsEngine: PhysicsEngine
    private storage: GameStorage;

    private loadStartCallback = () => {}
    private loadEndCallback = () => {}

    constructor(canvas: HTMLCanvasElement) {
        super();
        ServiceLocator.setService('canvas', canvas);
        this.renderEngine = new RenderEngine(canvas, this);
        this.physicsEngine = new PhysicsEngine();
        this.storage = new GameStorage();
    }

    addScene(scene: GameScene) {
        const sceneName = scene.name;
        if (!sceneName) throw new Error(`set name for scene being added with GameScene.setName`)
        if (this.scenes.has(sceneName)) throw new Error(`scene ${sceneName} already exists in the game`)

        this.scenes.set(sceneName, scene)
    }

    removeScene(sceneName: string) {
        const toRemove = this.scenes.get(sceneName);
        if (!toRemove) {
            throw new Error(`could not find and remove scene ${sceneName}`)
        }

        this.scenes.delete(sceneName)
    }

    loadScene(sceneName: string) {
        const toLoad = this.scenes.get(sceneName)
        const oldScene = this.currentScene;

        if (!toLoad) {
            throw new Error(`could find and load scene ${sceneName}`)
        }

        this.currentScene = toLoad;
        this.currentScene.start();

        ServiceLocator.setService('scene', this.currentScene.getScene())

        if (oldScene) {
            oldScene.destroy();
        }
    }

    getCurrentScene(): GameScene | null {
        return this.currentScene;
    }

    async preload() {
        await this.physicsEngine.init()
    }

    start() {
        super.start();
        ServiceLocator.setService('gameState', {isPaused: false});
        this.renderEngine.start();
    }

    pause() {
        const currentState = ServiceLocator.getService<GameState>('gameState');
        ServiceLocator.setService('gameState', {...currentState, isPaused: true});
    }

    play() {
        const currentState = ServiceLocator.getService<GameState>('gameState');
        ServiceLocator.setService('gameState', {...currentState, isPaused: false});
    }

    update(time: number) {
        super.update(time);
        this.currentScene?.update(time);
        this.physicsEngine.update(time);
    }

    destroy() {
        super.destroy();
        this.currentScene?.destroy();
    }

    onLoadStart(callback: () => void) {
        this.loadStartCallback = callback;
    }

    onLoadEnd(callback: () => void) {
        this.loadEndCallback = callback;
    }

    startLoad() {
        this.loadStartCallback();
    }

    endLoad() {
        this.loadEndCallback();
    }

    removeCurrentScene() {
        if (this.currentScene) {
            this.removeScene(this.currentScene.name);
            this.currentScene.destroy();
            this.currentScene = null;
            ServiceLocator.setService('scene', null)
        }
    }
}
