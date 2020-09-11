import Ammo from 'ammojs-typed';
import {Terrain} from "./Terrain";
import {ServiceLocator} from "./ServiceLocator";
import {GameObject} from "./GameObject";
import {CollisionData, RigidBodySettings} from "./interfaces/physics-interfaces";
import {GameCycleEntity} from "./GameCycleEntity";


const STATE = {DISABLE_DEACTIVATION: 4}
const FLAGS = {
    CF_STATIC_OBJECT: 1,
    CF_KINEMATIC_OBJECT: 2,
    CF_NO_CONTACT_RESPONSE: 4,
    CF_CUSTOM_MATERIAL_CALLBACK: 8,
    CF_CHARACTER_OBJECT: 16,
    CF_DISABLE_VISUALIZE_OBJECT: 32,
    CF_DISABLE_SPU_COLLISION_PROCESSING: 64,
    CF_HAS_CONTACT_STIFFNESS_DAMPING: 128,
    CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR: 256,
    CF_HAS_FRICTION_ANCHOR: 512,
    CF_HAS_COLLISION_SOUND_TRIGGER: 1024
}

export class PhysicsEngine extends GameCycleEntity {
    private physicsWorld?: Ammo.btDiscreteDynamicsWorld;
    private dynamicObjects = new Set<GameObject>();
    private tmpTransform?: Ammo.btTransform;

    private collisions = new Set<CollisionData>();

    async init() {
        await Ammo(Ammo);

        const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        const broadphase = new Ammo.btDbvtBroadphase();
        const solver = new Ammo.btSequentialImpulseConstraintSolver();

        this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(
            dispatcher,
            broadphase,
            solver,
            collisionConfiguration
        );
        this.physicsWorld.setGravity(new Ammo.btVector3(0, -9.82, 0));

        ServiceLocator.setService('physics', this);
    }

    public addTerrain(terrain: Terrain) {
        if (!this.physicsWorld) throw new Error('PhysicsEngine.init not called or finished yet');

        const {depth, depthExtents, width, widthExtents, maxHeight} = terrain.dimensions;
        const minHeight = 0;

        const terrainShape = createTerrainShape(terrain.heightData, width, depth, widthExtents, depthExtents, maxHeight)

        const terrainTransform = new Ammo.btTransform();
        terrainTransform.setIdentity();

        terrainTransform.setOrigin(new Ammo.btVector3(0, (maxHeight - minHeight) / 2, 0));

        const groundMass = 0;
        const groundLocalInertia = new Ammo.btVector3();
        const groundMotionState = new Ammo.btDefaultMotionState(terrainTransform);
        const groundBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(
            groundMass,
            groundMotionState,
            terrainShape,
            groundLocalInertia
        ))

        groundBody.setRestitution(0.3);
        groundBody.setFriction(4);
        groundBody.setRollingFriction(10);

        groundBody.setCollisionFlags(FLAGS.CF_STATIC_OBJECT);

        // @ts-ignore
        groundBody.object = terrain;

        terrain.setRigidBody(groundBody);

        this.physicsWorld.addRigidBody(groundBody);
    }

    public removeRigidBody(rb: Ammo.btRigidBody) {
        if (!this.physicsWorld) throw new Error('PhysicsEngine.init not called or finished yet');

        this.physicsWorld.removeRigidBody(rb);
    }

    public createRigidBody(settings: RigidBodySettings) {
        if (!this.physicsWorld) throw new Error('PhysicsEngine.init not called or finished yet');
        if (!settings.object) throw new Error('Specify GameObject to add rigid body to');

        let collider = this.createColliderShape(settings);

        if (settings.type !== 'sphere' && settings.margin === undefined) collider.setMargin(0.05);
        if (settings.margin !== undefined) collider.setMargin(settings.margin);

        const localInertia = new Ammo.btVector3(0, 0, 0);
        collider.calculateLocalInertia(settings.mass, localInertia);
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        const pos = settings.object.position;
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        const motionState = new Ammo.btDefaultMotionState(transform);
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(
            settings.mass,
            motionState,
            collider,
            localInertia
        );
        const body = new Ammo.btRigidBody(rbInfo);

        // @ts-ignorew
        body.object = settings.object;

        if (settings.mass > 0) {
            this.dynamicObjects.add(settings.object);
        }

        if (settings.rollingFriction !== undefined) body.setRollingFriction(settings.rollingFriction);
        if (settings.restitution !== undefined) body.setRestitution(settings.restitution);
        if (settings.friction !== undefined) body.setFriction(settings.friction);
        if (settings.isDynamic) body.setActivationState(STATE.DISABLE_DEACTIVATION);
        if (settings.isKinematic !== undefined) {
            const flags = settings.isKinematic ? body.getCollisionFlags() | FLAGS.CF_KINEMATIC_OBJECT : body.getCollisionFlags() & ~FLAGS.CF_KINEMATIC_OBJECT;
            body.setCollisionFlags(flags);
        }
        if (settings.isStatic !== undefined) {
            const flags = settings.isStatic ? body.getCollisionFlags() | FLAGS.CF_STATIC_OBJECT : body.getCollisionFlags() & ~FLAGS.CF_STATIC_OBJECT;
            body.setCollisionFlags(flags);
        }
        if (settings.noContactResponse !== undefined) {
            const flags = settings.noContactResponse ? body.getCollisionFlags() | FLAGS.CF_NO_CONTACT_RESPONSE : body.getCollisionFlags() & ~FLAGS.CF_NO_CONTACT_RESPONSE;
            body.setCollisionFlags(flags);
        }
        if (settings.isCharacter !== undefined) {
            const flags = settings.isCharacter ? body.getCollisionFlags() | FLAGS.CF_CHARACTER_OBJECT : body.getCollisionFlags() & ~FLAGS.CF_CHARACTER_OBJECT;
            body.setCollisionFlags(flags);
        }

        if (settings.group !== undefined && settings.mask !== undefined) {
            this.physicsWorld.addRigidBody(body, settings.group, settings.mask);
        } else {
            this.physicsWorld.addRigidBody(body);
        }

        return body;
    }

    public createGhostObject(settings: RigidBodySettings) {
        if (!this.physicsWorld) throw new Error('PhysicsEngine.init not called or finished yet');
        if (!settings.object) throw new Error('Specify GameObject to add rigid body to');

        let collider = this.createColliderShape(settings);

        const transform = new Ammo.btTransform();
        transform.setIdentity();
        const pos = settings.object.position;
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));

        const ghostObject = new Ammo.btGhostObject();
        ghostObject.setWorldTransform(transform);
        ghostObject.setCollisionShape(collider);
        if (settings.isDynamic) ghostObject.setActivationState(STATE.DISABLE_DEACTIVATION);
        if (settings.isKinematic) ghostObject.setCollisionFlags(FLAGS.CF_KINEMATIC_OBJECT);
        if (settings.noContactResponse) ghostObject.setCollisionFlags(FLAGS.CF_NO_CONTACT_RESPONSE);
        if (settings.isCharacter) ghostObject.setCollisionFlags(FLAGS.CF_CHARACTER_OBJECT);

        this.physicsWorld.addCollisionObject(ghostObject);

        // @ts-ignore
        ghostObject.object = settings.object;

        return ghostObject;
    }

    private createColliderShape(settings: RigidBodySettings) {
        let collider: Ammo.btCollisionShape;

        switch (settings.type) {
            case "box": {
                const {sx, sy, sz} = settings;
                collider = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
                break;
            }
            case "cylinder": {
                const {radius, height} = settings;
                collider = new Ammo.btCylinderShape(new Ammo.btVector3(
                    radius,
                    height * 0.5,
                    radius
                ));
                break;
            }
            case "cone": {
                const {radius, height} = settings;
                collider = new Ammo.btConeShape(radius, height);
                break;
            }
            case "sphere": {
                const {radius} = settings;
                collider = new Ammo.btSphereShape(radius);
                break;
            }
            case "capsule": {
                const {radius, height} = settings;
                collider = new Ammo.btCapsuleShape(radius, height);
                break;
            }
        }

        return collider;
    }

    private detectCollisions() {
        if (!this.physicsWorld) throw new Error('PhysicsEngine.init not called or finished yet');

        this.collisions.clear();

        const dispatcher = this.physicsWorld.getDispatcher();
        const numManifolds = dispatcher.getNumManifolds();
        for (let i = 0; i < numManifolds; i++) {
            const contactManifold = dispatcher.getManifoldByIndexInternal(i);
            const numContacts = contactManifold.getNumContacts();
            for (let j = 0; j < numContacts; j++) {
                const contactPoint = contactManifold.getContactPoint(j);
                const distance = contactPoint.getDistance();

                if (distance > 0) continue;

                // @ts-ignore
                const rb0: Ammo.btRigidBody = Ammo.castObject(contactManifold.getBody0(), Ammo.btRigidBody);
                // @ts-ignore
                const rb1: Ammo.btRigidBody = Ammo.castObject(contactManifold.getBody1(), Ammo.btRigidBody);

                // @ts-ignore
                const gameObject0 = rb0.object as GameObject;
                // @ts-ignore
                const gameObject1 = rb1.object as GameObject;

                const worldPos0 = contactPoint.get_m_positionWorldOnA();
                const worldPos1 = contactPoint.get_m_positionWorldOnB();
                const localPos0 = contactPoint.get_m_localPointA();
                const localPos1 = contactPoint.get_m_localPointB();

                this.collisions.add({
                    object0: {
                        object: gameObject0,
                        worldPosition: worldPos0,
                        localPosition: localPos0
                    },
                    object1: {
                        object: gameObject1,
                        worldPosition: worldPos1,
                        localPosition: localPos1
                    },
                    isOfTags: (tag0, tag1) => {
                        const gameObjectTag0 = gameObject0?.tag;
                        const gameObjectTag1 = gameObject1?.tag;
                        return (gameObjectTag0 === tag0 && gameObjectTag1 === tag1) || (gameObjectTag0 === tag1 && gameObjectTag1 === tag0)
                    },
                    involvesName: (name: string) => {
                        const gameObjectName0 = gameObject0?.getName();
                        const gameObjectName1 = gameObject1?.getName();
                        return gameObjectName0 === name || gameObjectName1 === name;
                    }
                })
            }

        }
    }

    get detectedCollisions() {
        return this.collisions;
    }

    update(time: number) {
        super.update(time);
        if (!this.physicsWorld) throw new Error('PhysicsEngine.init not called or finished yet');

        this.physicsWorld.stepSimulation(time * 100);

        this.dynamicObjects.forEach(object => {
            if (!this.tmpTransform) this.tmpTransform = new Ammo.btTransform();

            const objPhys = object.rigidBody;
            const motionState = objPhys?.getMotionState();
            if (motionState) {

                motionState.getWorldTransform(this.tmpTransform);
                const position = this.tmpTransform.getOrigin();
                const quaternion = this.tmpTransform.getRotation();
                object.object3D.position.set(position.x(), position.y(), position.z());
                object.object3D.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w());
            }
        })

        this.detectCollisions()
    }
}

function createTerrainShape(normalizedHeightData: Float32Array = new Float32Array(),
                            terrainWidth: number = 0,
                            terrainDepth: number = 0,
                            terrainWidthExtents: number = 0,
                            terrainDepthExtents: number = 0,
                            terrainMaxHeight: number = 0,
                            terrainMinHeight: number = 0) {

    // This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
    const heightScale = 1;

    // Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
    const upAxis = 1;

    // hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
    const hdt: Ammo.PHY_ScalarType = "PHY_FLOAT";

    // Set this to your needs (inverts the triangles)
    const flipQuadEdges = true;

    // Creates height data buffer in Ammo heap
    const ammoHeightData = Ammo._malloc(4 * terrainWidth * terrainDepth);

    // Copy the javascript height data array to the Ammo one.
    let p = 0;
    let p2 = 0;
    for (let j = 0; j < terrainDepth; j++) {
        for (let i = 0; i < terrainWidth; i++) {

            // write 32-bit float data to memory
            Ammo.HEAPF32[ammoHeightData + p2 >> 2] = normalizedHeightData[p] * terrainMaxHeight;

            p++;

            // 4 bytes/float
            p2 += 4;
        }
    }

    // Creates the heightfield physics shape
    const heightFieldShape = new Ammo.btHeightfieldTerrainShape(
        terrainWidth,
        terrainDepth,

        ammoHeightData,

        heightScale,
        terrainMinHeight,
        terrainMaxHeight,

        upAxis,
        hdt,
        flipQuadEdges
    );

    // Set horizontal scale
    const scaleX = terrainWidthExtents / (terrainWidth - 1);
    const scaleZ = terrainDepthExtents / (terrainDepth - 1);
    heightFieldShape.setLocalScaling(new Ammo.btVector3(scaleX, 1, scaleZ));

    heightFieldShape.setMargin(0.05);

    return heightFieldShape;

}
