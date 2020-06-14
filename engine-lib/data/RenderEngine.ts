import * as THREE from "three";
import {Game} from "./Game";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export class RenderEngine {
    private camera: THREE.Camera;
    private renderer: THREE.WebGLRenderer;

    constructor(canvas: HTMLCanvasElement, private game: Game) {
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
        this.camera.rotateX(-0.2);
        this.camera.position.z = 2;
        this.camera.position.y = 2;

        this.renderer = new THREE.WebGLRenderer({antialias: true, canvas});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const controls = new OrbitControls( this.camera, this.renderer.domElement );
        controls.minDistance = 1;
        controls.maxDistance = 100;
        controls.enablePan = true;
        controls.maxPolarAngle = Math.PI / 2;
        controls.target.set( 0, 1, -5 );
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
