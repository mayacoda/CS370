import {GameObject} from "./GameObject";
import * as THREE from "three";
import {GameCycleEntity} from "./interfaces/GameCycleEntity";
import {TextureLoader} from "./TextureLoader";
import {ServiceLocator} from "./ServiceLocator";

export class GameScene extends GameCycleEntity {
    private objects: Set<GameObject>
    private scene: THREE.Scene

    private skyboxMesh?: THREE.Mesh;

    constructor() {
        super();
        this.objects = new Set<GameObject>();
        this.scene = new THREE.Scene();
    }

    getScene() {
        return this.scene;
    }

    addObject(object: GameObject) {
        this.objects.add(object);
        object.setScene(this);
    }

    removeObject(object: GameObject) {
        this.objects.delete(object);
        object.setScene(null)
    }

    /**
     * @param texture - pos-x, neg-x, pos-y, neg-y, pos-z, neg-z.
     */
    loadSkybox(texture: string[] | string) {
        // cube texture map
        if (Array.isArray(texture)) {
            this.scene.background = TextureLoader.loadCubeTexture(texture);
        } else {
            // equirectangular map
            const skybox = TextureLoader.loadTexture(texture);
            skybox.magFilter = THREE.LinearFilter;
            skybox.minFilter = THREE.LinearFilter;

            const shader = THREE.ShaderLib.equirect;
            const material = new THREE.ShaderMaterial({
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: shader.uniforms,
                depthWrite: false,
                side: THREE.BackSide,
            });
            material.uniforms.tEquirect.value = skybox;
            const plane = new THREE.BoxBufferGeometry(1, 1, 1);
            this.skyboxMesh = new THREE.Mesh(plane, material);
            this.scene.add(this.skyboxMesh);
        }
    }

    loadBackgroundColor(color: string | number) {
        this.scene.background = new THREE.Color(color)
    }

    start() {
        super.start();

        for (const object of this.objects) {
            if (object.object3D) {
                this.scene.add(object.object3D);
            }

            object.start();
        }

        const groundGeometry = new THREE.PlaneBufferGeometry(20, 20, 32, 32);
        const groundMaterial = new THREE.MeshStandardMaterial({color: '#128d4f'})
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true

        this.scene.add(ground);
    }

    update(): void {
        super.update();
        if (this.skyboxMesh) {
            this.skyboxMesh.position.copy(ServiceLocator.getService<THREE.Camera>('camera').position)
        }

        for (const object of this.objects) {
            object.update();
        }
    }
}
