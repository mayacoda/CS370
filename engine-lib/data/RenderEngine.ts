import * as THREE from "three";
import {Game} from "./Game";

export class RenderEngine {
    private camera: THREE.Camera;
    private renderer: THREE.WebGLRenderer;

    constructor(canvas: HTMLCanvasElement, private game: Game) {
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
        this.camera.position.z = 1;

        this.renderer = new THREE.WebGLRenderer({antialias: true, canvas});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    start() {
        this.update();
    }

    update() {
        const step = () => {
            requestAnimationFrame(step)
            let currentGameScene = this.game.getCurrentScene();

            let scene = currentGameScene.getScene();
            this.renderer.render(scene, this.camera)
            this.game.update();
        }
        step();
    }
}
