import * as THREE from "three";
import {Game} from "./Game";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {ServiceLocator} from "./ServiceLocator";

export enum RenderLayers {
    Default,
    UnrealBloom
}

export class RenderEngine {
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;

    constructor(canvas: HTMLCanvasElement, private game: Game) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 1000);
        this.camera.position.z = -8;
        this.camera.position.x = 8;
        this.camera.position.y = 6;

        ServiceLocator.setService('camera', this.camera)

        this.renderer = new THREE.WebGLRenderer({antialias: true, canvas});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

        ServiceLocator.setService('renderer', this.renderer)

        const controls = new OrbitControls( this.camera, this.renderer.domElement );
        controls.minDistance = 1;
        controls.maxDistance = 100;
        controls.enablePan = true;
        controls.maxPolarAngle = Math.PI / 2;
        controls.target.set( 0, 0, 0);
        controls.update();
    }

    start() {
        this.update();
    }

    update() {
        const step = () => {
            requestAnimationFrame(step)
            this.game.update();

            let currentGameScene = this.game.getCurrentScene();
            let scene = currentGameScene.getScene();
            this.renderer.render(scene, this.camera)
        }
        step();
    }
}
