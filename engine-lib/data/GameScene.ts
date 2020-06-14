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
    }

    removeObject(object: GameObject) {
        this.objects.delete(object);
    }

    start() {

        this.scene.background = new THREE.Color( 0xffc275 );

        for (const object of this.objects) {
            object.start();

            if (object.mesh) {
                this.scene.add(object.mesh);
            }
        }

        const ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1000, 1000 ), new THREE.MeshPhongMaterial( { color: 0x38c77f, depthWrite: false } ) );
        ground.rotation.x = - Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add( ground );

        this.scene.add( new THREE.HemisphereLight( 0xf7ac4f, 0x38c77f, 1 ) );
        let directionalLight = new THREE.DirectionalLight(0xffd16e, 1);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -25;
        directionalLight.shadow.camera.left = -25;
        directionalLight.shadow.camera.right = 25;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.mapSize.set(1024, 1024);
        this.scene.add(directionalLight)
    }

    update(): void {
        for (const object of this.objects) {
            object.update()
        }
    }
}
