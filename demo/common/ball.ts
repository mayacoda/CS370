import {GameObject, GameScene} from "../../engine-lib/data";
import {
    SphereGeometry,
    Vector3,
    CircleGeometry,
    MeshBasicMaterial,
    DoubleSide,
    Mesh,
    Material,
    MeshPhongMaterial,
    PositionalAudio
} from 'three';
import Ammo from "ammojs-typed";
import {ServiceLocator} from "../../engine-lib/data/ServiceLocator";
import {PhysicsEngine} from "../../engine-lib/data/PhysicsEngine";
import {Terrain} from "../../engine-lib/data/Terrain";
import {randomRange} from "../../engine-lib/utilities";
import {CollisionData} from "../../engine-lib/data/interfaces/physics-interfaces";

export async function launchBall(scene: GameScene, position: Vector3, color: string) {
    const radius = 0.15;
    const ball = new GameObject();

    ball.createMesh(new SphereGeometry(radius, 20, 20), new MeshPhongMaterial({
        color,
        transparent: true
    }))
    ball.translate(position.x, position.y + 5, position.z);

    ball.tag = 'ball'

    const audio = scene.getAudio();
    const sound = await audio.loadPositionalSound('audio/hit.wav', 'impact_sound', ball)
    sound.setVolume(5);

    ball.onStart(() => {
        ball.createRigidBody({
            type: 'sphere',
            radius: radius,
            mass: 1,
            restitution: 2,
            rollingFriction: 10
        });

        const direction = new Vector3();
        direction.copy(position);
        let goal = new Vector3(0, position.y + 5, 0);
        goal.sub(direction).normalize().multiplyScalar(randomRange(10, 15));
        ball.rigidBody?.applyCentralImpulse(new Ammo.btVector3(goal.x, goal.y, goal.z));
    });

    const hits: GameObject[] = [];

    ball.onUpdate(() => {

        const physics = ServiceLocator.getService<PhysicsEngine>('physics');

        const collision = Array.from(physics.detectedCollisions).find(collision => {
            return collision.isOfTags('ball', 'terrain') && collision.involvesName(ball.getName());
        })

        if (collision) {
            markCollision(scene, collision, hits, color)
            let audio = ball.object3D.children[0] as PositionalAudio;
            const linearVelocity = ball.rigidBody?.getLinearVelocity();
            const speed = linearVelocity ? linearVelocity.length() : 0;
            if (!audio || speed < 0.2) return;

            if (audio.isPlaying) {
                audio.stop();
            }
            audio.play();
        }
    })

    ball.castShadow(true);
    ball.object3D.name = 'Ball';
    scene.addObject(ball);

    ball.start();

    return {ball, hits};
}


function markCollision(scene: GameScene,
                       collision: CollisionData,
                       hits: GameObject[],
                       color: string) {
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
    circle.createMesh(new CircleGeometry(.2, 32), new MeshBasicMaterial({
        color,
        side: DoubleSide
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

export function hideBall(ball: GameObject) {
    if (ball.object3D instanceof Mesh) {
        const material = ball.object3D.material as Material;
        material.opacity = 0;
    }
}

export function removeBall(ball: GameObject, hits: GameObject[]) {
    hits.forEach(hit => hit.destroy());
    ball.destroy();
}
