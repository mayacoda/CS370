import {Game} from "./Game";
import {GameState, ServiceLocator} from "./ServiceLocator";
import {WebGLRenderer, Clock, PCFShadowMap, Camera, PerspectiveCamera} from "three";

export class RenderEngine {
    private readonly renderer: WebGLRenderer;
    private readonly clock: Clock;

    constructor(canvas: HTMLCanvasElement, private game: Game) {
        this.clock = new Clock();

        this.renderer = new WebGLRenderer({antialias: true, canvas});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFShadowMap;

        ServiceLocator.setService('renderer', this.renderer)

        window.addEventListener('resize', () => {
            const camera = ServiceLocator.getService<Camera>('camera');
            if (camera instanceof PerspectiveCamera) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            }

            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);
    }

    start() {
        this.update();
    }

    update() {
        const step = () => {
            requestAnimationFrame(step);

            const {isPaused} = ServiceLocator.getService<GameState>('gameState');

            if (isPaused) return;

            const delta = this.clock.getDelta();
            this.game.update(delta);

            const currentGameScene = this.game.getCurrentScene();
            const scene = currentGameScene?.getScene();

            if (scene) {
                const camera = ServiceLocator.getService<Camera>('camera');
                this.renderer.render(scene, camera);
            }

        }
        step();
    }
}
