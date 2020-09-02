import {GameObject, GameScene} from "../../engine-lib/data";
import * as THREE from 'three';
import Ammo from "ammojs-typed";
import {ServiceLocator} from "../../engine-lib/data/ServiceLocator";
import {PhysicsEngine} from "../../engine-lib/data/PhysicsEngine";
import {Terrain} from "../../engine-lib/data/Terrain";
import {randomRange} from "../../engine-lib/utilities";
import {CollisionData} from "../../engine-lib/data/interfaces/physics-interfaces";

export function launchBall(scene: GameScene, position: THREE.Vector3) {
    const radius = 0.15;
    const ball = new GameObject();

    ball.createMesh(new THREE.SphereGeometry(radius, 20, 20), new THREE.MeshPhongMaterial({
        color: '#c6c611',
        transparent: true
    }))
    ball.translate(position.x, position.y + 5, position.z);

    ball.tag = 'ball'

    ball.onStart(() => {
        ball.createRigidBody({
            type: 'sphere',
            radius: radius,
            mass: 1,
            restitution: 2,
            rollingFriction: 10
        });

        const direction = new THREE.Vector3();
        direction.copy(position);
        let goal = new THREE.Vector3(0, position.y + 5, 0);
        goal.sub(direction).normalize().multiplyScalar(randomRange(10, 15));
        ball.rigidBody?.applyCentralImpulse(new Ammo.btVector3(goal.x, goal.y, goal.z));
    });

    const hits: GameObject[] = [];

    ball.onUpdate(() => {

        const physics = ServiceLocator.getService<PhysicsEngine>('physics');

        const collision = Array.from(physics.detectedCollisions).find(collision => collision.isOfTags('ball', 'terrain'))

        if (collision) markCollision(scene, collision, hits)
    })

    ball.castShadow(true);
    ball.object3D.name = 'Ball';
    scene.addObject(ball);

    ball.start();

    return {ball, hits};
}


function markCollision(scene: GameScene, collision: CollisionData, hits: GameObject[]) {
    const ballObject = collision.object0.object.tag === 'ball' ? collision.object0 : collision.object1
    const terrainObject = collision.object0.object.tag === 'terrain' ? collision.object0 : collision.object1
    let terrain = terrainObject.object as Terrain;

    const hitMarked = hits.some(hit => {
        let distance = hit.position.distanceTo(ballObject.object.position);
        return distance < 2;
    });

    if (hitMarked) {
        return;
    }

    const circle = new GameObject();
    circle.createMesh(new THREE.CircleGeometry(.2, 32), new THREE.MeshBasicMaterial({
        color: '#c6c611',
        side: THREE.DoubleSide
    }))

    let {x, z, y} = ballObject.object.position;

    const elevation = terrain.getHeightAtPoint(x, z) || y;

    circle.translate(x, elevation + 0.1, z);

    circle.rotate(Math.PI / 2, 0, 0);
    let normalAtPoint = terrain.getNormalAtPoint(x, z);
    if (normalAtPoint) circle.object3D.up.copy(normalAtPoint);

    circle.object3D.name = 'Circle';

    hits.push(circle);
    scene.addObject(circle);
}
