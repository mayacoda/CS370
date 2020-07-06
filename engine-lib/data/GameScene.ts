import {GameObject} from "./GameObject";
import * as THREE from "three";
import {GameCycleEntity} from "./interfaces/GameCycleEntity";

export class GameScene extends GameCycleEntity {
    private objects: Set<GameObject>
    private scene: THREE.Scene

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

    start() {
        super.start();

        this.scene.background = new THREE.Color( 0xffc275 );

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
        for (const object of this.objects) {
            object.update();
        }
    }
}
