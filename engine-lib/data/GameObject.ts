import {GameCycleEntity} from "./GameCycleEntity";
import {ModelLoader} from "./ModelLoader";
import {GameScene} from "./GameScene";
import {TextureLoader} from "./TextureLoader";
import Ammo from "ammojs-typed";
import {PhysicsEngine} from "./PhysicsEngine";
import {GameState, ServiceLocator} from "./ServiceLocator";
import {RigidBodySettings} from "./interfaces/physics-interfaces";
import {
    Vector3,
    Object3D,
    Mesh,
    Material,
    Geometry,
    MeshPhongMaterial,
    Color,
    Quaternion,
    DoubleSide,
    CylinderGeometry,
    SphereGeometry
} from "three";

export class GameObject extends GameCycleEntity {
    object3D: Object3D;
    tag: string = '';

    protected children: Set<GameObject>;
    protected scene: GameScene | null = null;

    protected rb?: Ammo.btRigidBody;
    public ghostObject?: Ammo.btGhostObject;

    rigidBodyMesh?: Mesh;

    constructor() {
        super();
        this.object3D = new Object3D();
        this.children = new Set<GameObject>();
    }

    start() {
        super.start();
        this.children.forEach(child => {
            child.setScene(this.scene)
            child.start()
        })
    }

    update(time?: number) {
        this.children.forEach(child => child.update(time))
        super.update();

        if (this.rigidBodyMesh) {
            this.updateRigidBodyHelper(this.rigidBodyMesh);
        }
    }

    private updateRigidBodyHelper(mesh: Mesh) {
        let worldTransform: Ammo.btTransform | undefined = undefined;

        if (this.ghostObject) {
            worldTransform = this.ghostObject.getWorldTransform();
        }

        if (this.rb) {
            const tempTransform = new Ammo.btTransform();
            this.rb.getMotionState().getWorldTransform(tempTransform);
            worldTransform = tempTransform;
        }

        if (worldTransform !== undefined) {
            const origin = worldTransform.getOrigin();
            mesh.position.set(origin.x(), origin.y(), origin.z());
        }
    }

    destroy() {
        this.children.forEach(child => child.destroy())
        this.scene?.removeObject(this);

        if (this.rb) {
            const physics = ServiceLocator.getService<PhysicsEngine>('physics');
            physics.removeRigidBody(this.rb);
        }

        if (this.object3D instanceof Mesh) {
            this.object3D.geometry.dispose();
            (this.object3D.material as Material).dispose();
        }

        if (this.rigidBodyMesh) {
            this.rigidBodyMesh.geometry.dispose();
            (this.rigidBodyMesh.material as Material).dispose();
        }

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

    createMesh(geometry?: Geometry, material?: Material) {
        this.object3D = new Mesh(geometry, material)
    }

    async loadObj(modelPath: string, materialPath: string) {
        this.object3D = await ModelLoader.loadObj(modelPath, materialPath);
    }

    async loadGLTF(modelPath: string): Promise<ReturnType<typeof ModelLoader.loadGltf> | void> {
        let gltf = await ModelLoader.loadGltf(modelPath);
        this.object3D = gltf.scene;

        return gltf
    }

    async loadFBX(modelPath: string): Promise<ReturnType<typeof ModelLoader.loadFbx> | void> {
        let fbx = await ModelLoader.loadFbx(modelPath);
        this.object3D = fbx;

        this.object3D.traverse(child => {
            if (child instanceof Mesh) {
                let material = child.material;
                if (material instanceof MeshPhongMaterial) {
                    material.shininess = 0;
                    material.color = new Color('#fff')
                    material.specular = new Color('#fff')
                }
            }
        })

        return fbx
    }

    async loadTransparentTexture(path: string) {
        const texture = await TextureLoader.loadTexture(path);
        this.object3D.traverse(child => {
            if (child instanceof Mesh) {
                let material = child.material;
                if (!Array.isArray(material)) {
                    material.map = texture;
                    material.transparent = true;
                    material.side = DoubleSide;
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
    rotate(vec3: Vector3): void
    rotate(...args: any[]) {
        let vec3: Vector3
        if (args[0] instanceof Vector3) {
            vec3 = args[0]
        } else {
            vec3 = new Vector3(args[0], args[1], args[2])
        }
        this.object3D.rotateX(vec3.x)
        this.object3D.rotateY(vec3.y)
        this.object3D.rotateZ(vec3.z)
    }

    scale(size: number): void
    scale(vec3: Vector3): void
    scale(x?: number, y?: number, z?: number): void
    scale(...args: any[]) {
        let vec3: Vector3
        if (args[0] instanceof Vector3) {
            vec3 = args[0]
        } else if (args.length === 3) {
            vec3 = new Vector3(args[0], args[1], args[2])
        } else {
            vec3 = new Vector3(args[0], args[0], args[0])
        }
        this.object3D.scale.x = vec3.x;
        this.object3D.scale.y = vec3.y;
        this.object3D.scale.z = vec3.z;
    }

    translate(x?: number, y?: number, z?: number): void
    translate(vec3: Vector3): void
    translate(...args: any[]) {
        let vec3: Vector3
        if (args[0] instanceof Vector3) {
            vec3 = args[0]
        } else {
            vec3 = new Vector3(args[0], args[1], args[2])
        }
        this.object3D.translateX(vec3.x)
        this.object3D.translateY(vec3.y)
        this.object3D.translateZ(vec3.z)

        // this.translateKinematicCollider();
    }

    private translateKinematicCollider() {
        if (this.rb || this.ghostObject) {
            const threePos = new Vector3();
            const threeQuat = new Quaternion();

            threePos.copy(this.object3D.position);
            threeQuat.copy(this.object3D.quaternion);

            const ammoPos = new Ammo.btVector3();
            const ammoQuat = new Ammo.btQuaternion(0, 0, 0, 0);
            const transform = new Ammo.btTransform();

            ammoPos.setValue(threePos.x, threePos.y, threePos.z);
            ammoQuat.setValue(threeQuat.x, threeQuat.y, threeQuat.z, threeQuat.w);

            transform.setIdentity();
            transform.setOrigin(ammoPos);
            transform.setRotation(ammoQuat);

            if (this.rb) {
                const ms = this.rb.getMotionState();
                if (ms) {
                    ms.setWorldTransform(transform);
                }
            }

            if (this.ghostObject) {
                this.ghostObject.setWorldTransform(transform);
            }
        }
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

    get rigidBody() {
        return this.rb;
    }

    setName(name: string) {
        this.object3D.name = name;
    }

    getMeshGroupByName(name: string): Promise<Object3D | null> {
        return new Promise((resolve) => {
            this.object3D.traverse(child => {
                if (child.name === name) {
                    resolve(child)
                }
            })

            resolve(null)
        })
    }

    createRigidBody(settings: RigidBodySettings) {
        const physics = ServiceLocator.getService<PhysicsEngine>('physics');
        this.rb = physics.createRigidBody({...settings, object: this});
        const transform = new Ammo.btTransform();
        this.rb.getMotionState().getWorldTransform(transform);
        this.createCollisionShapeHelper(settings, transform, '#e3b3b3');
    }

    createGhostObject(settings: RigidBodySettings) {
        const physics = ServiceLocator.getService<PhysicsEngine>('physics');
        this.ghostObject = physics.createGhostObject({...settings, object: this});
        this.createCollisionShapeHelper(settings, this.ghostObject.getWorldTransform(), '#ffc700');
    }

    createCollisionShapeHelper(settings: RigidBodySettings, worldTransform: Ammo.btTransform, color: string) {
        const {debug} = ServiceLocator.getService<GameState>('gameState');
        if (!debug) return;

        if (settings.type === 'sphere') {
            this.rigidBodyMesh = new Mesh(new SphereGeometry(
                settings.radius,
                10,
                10
            ), new MeshPhongMaterial({color, opacity: 0.5, transparent: true, side: DoubleSide}))
        }

        if (settings.type === 'cylinder') {
            this.rigidBodyMesh = new Mesh(new CylinderGeometry(
                settings.radius,
                settings.radius,
                settings.height,
                10,
                10
            ), new MeshPhongMaterial({color, opacity: 0.5, transparent: true, side: DoubleSide}))
        }

        if (this.rigidBodyMesh) {
            this.rigidBodyMesh.name = (settings.object?.getName() || '') + ' Collision Shape'

            const origin = worldTransform.getOrigin();
            this.rigidBodyMesh.position.set(origin.x(), origin.y(), origin.z());
            const scene = this.scene?.getScene();
            if (scene) {
                scene.add(this.rigidBodyMesh);
            }
        }
    }

    getName() {
        return this.object3D.name;
    }
}
