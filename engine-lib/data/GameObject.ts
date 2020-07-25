import * as THREE from "three"
import {GameCycleEntity} from "./interfaces/GameCycleEntity";
import {ModelLoader} from "./ModelLoader";
import {GameScene} from "./GameScene";
import {TextureLoader} from "./TextureLoader";

export class GameObject extends GameCycleEntity {
    object3D: THREE.Object3D;
    private children: Set<GameObject>;
    private scene: GameScene | null = null;

    constructor() {
        super();
        this.object3D = new THREE.Object3D();
        this.children = new Set<GameObject>();
    }

    start() {
        super.start();
        this.children.forEach(child => {
            child.setScene(this.scene)
            child.start()
        })
    }

    update() {
        this.children.forEach(child => child.update())
        super.update();
    }

    destroy() {
        this.children.forEach(child => child.destroy())
        super.destroy();
    }

    addChild(object: GameObject) {
        this.object3D.add(object.object3D);
        this.children.add(object)
    }

    removeChild(object: GameObject) {
        this.object3D.remove(object.object3D)
        this.children.delete(object)
    }

    createMesh(geometry?: THREE.Geometry, material?: THREE.Material) {
        this.object3D = new THREE.Mesh(geometry, material)
    }

    async loadObj(modelPath: string, materialPath: string) {
        this.object3D = await ModelLoader.loadObj(modelPath, materialPath);
    }

    async loadModel(path: string) {
        this.object3D = await ModelLoader.loadModel(path)
    }

    async loadTransparentTexture(path: string) {
        const texture = await TextureLoader.loadTexture(path);
        this.object3D.traverse(child => {
            if (child instanceof THREE.Mesh) {
                let material = child.material;
                if (!Array.isArray(material)) {
                    material.map = texture;
                    material.transparent = true;
                    material.side = THREE.DoubleSide;
                    material.alphaTest = 0.5;
                }
            }
        })
    }

    setScene(scene: GameScene | null) {
        this.scene = scene;
    }

    getScene() {
        return this.scene;
    }

    castShadow(toggle = true) {
        this.object3D.castShadow = toggle;
        this.object3D.traverse(child => child.castShadow = toggle);
    }

    receiveShadow(toggle = true) {
        this.object3D.receiveShadow = toggle;
        this.object3D.traverse(child => child.receiveShadow = toggle);
    }

    rotate(x?: number, y?: number, z?: number): void
    rotate(vec3: THREE.Vector3): void
    rotate(...args: any[]) {
        let vec3: THREE.Vector3
        if (args[0] instanceof THREE.Vector3) {
            vec3 = args[0]
        } else {
            vec3 = new THREE.Vector3(args[0], args[1], args[2])
        }
        this.object3D.rotateX(vec3.x)
        this.object3D.rotateY(vec3.y)
        this.object3D.rotateZ(vec3.z)
    }

    scale(size: number): void
    scale(vec3: THREE.Vector3): void
    scale(x?: number, y?: number, z?: number): void
    scale(...args: any[]) {
        let vec3: THREE.Vector3
        if (args[0] instanceof THREE.Vector3) {
            vec3 = args[0]
        } else if (args.length === 3) {
            vec3 = new THREE.Vector3(args[0], args[1], args[2])
        } else {
            vec3 = new THREE.Vector3(args[0], args[0], args[0])
        }
        this.object3D.scale.x = vec3.x;
        this.object3D.scale.y = vec3.y;
        this.object3D.scale.z = vec3.z;
    }

    translate(x?: number, y?: number, z?: number): void
    translate(vec3: THREE.Vector3): void
    translate(...args: any[]) {
        let vec3: THREE.Vector3
        if (args[0] instanceof THREE.Vector3) {
            vec3 = args[0]
        } else {
            vec3 = new THREE.Vector3(args[0], args[1], args[2])
        }
        this.object3D.translateX(vec3.x)
        this.object3D.translateY(vec3.y)
        this.object3D.translateZ(vec3.z)
    }

    get position() {
        return this.object3D.position;
    }

    get size() {
        return this.object3D.scale;
    }

    get rotation() {
        return this.object3D.rotation;
    }

    setName(name: string) {
        this.object3D.name = name;
    }

    getMeshGroupByName(name: string): Promise<THREE.Object3D | null> {
        return new Promise((resolve) => {
            this.object3D.traverse(child => {
                if (child.name === name) {
                    resolve(child)
                }
            })

          resolve(null)
        })
    }
}
