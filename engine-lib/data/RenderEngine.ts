import * as THREE from "three";
import {Game} from "./Game";
import {ServiceLocator} from "./ServiceLocator";

export class RenderEngine {
    private readonly renderer: THREE.WebGLRenderer;
    private readonly clock: THREE.Clock;

    constructor(canvas: HTMLCanvasElement, private game: Game) {
        this.clock = new THREE.Clock();

        this.renderer = new THREE.WebGLRenderer({antialias: true, canvas});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

        ServiceLocator.setService('renderer', this.renderer)

        window.addEventListener('resize', () => {
            const camera = ServiceLocator.getService<THREE.Camera>('camera');
            if (camera instanceof THREE.PerspectiveCamera) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            }

            this.renderer.setSize( window.innerWidth, window.innerHeight );
        }, false);
    }

    start() {
        this.update();
    }

    update() {
        const step = () => {
            requestAnimationFrame(step);
            const delta = this.clock.getDelta();
            this.game.update(delta);

            const currentGameScene = this.game.getCurrentScene();
            const scene = currentGameScene.getScene();

            const camera = ServiceLocator.getService<THREE.Camera>('camera');
            this.renderer.render(scene, camera);
        }
        step();
    }
}
