import {GameObject} from "./GameObject";
import {Camera, Vector3, PerspectiveCamera, OrthographicCamera} from "three";
import {ServiceLocator} from "./ServiceLocator";
import {AudioEngine} from "./AudioEngine";

export class GameCamera extends GameObject {
    camera: Camera;
    private lookAtTarget?: GameObject;
    private followTarget?: GameObject;
    private followOffset = new Vector3();

    private parent?: GameObject;

    get object3D() {
        return this.parent ? this.parent.object3D : this.camera
    }

    set object3D(object) {
    }

    constructor(type: 'perspective' | 'orthographic') {
        super();
        const canvas = ServiceLocator.getService<HTMLCanvasElement>('canvas');
        const {width, height} = canvas;


        switch (type) {
            case "perspective":
                this.camera = new PerspectiveCamera(40, width / height);
                break;
            case "orthographic":
                this.camera = new OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
                break;
        }

        ServiceLocator.setService('camera', this.camera);

        this.camera.add(ServiceLocator.getService<AudioEngine>('audio').getListener());
    }

    lookAt(target: GameObject) {
        this.lookAtTarget = target;
    }

    follow(target: GameObject, x = 0, y = 0, z = 0) {
        this.followTarget = target;
        this.followOffset = new Vector3(x, y, z);

        const parent = new GameObject();
        parent.object3D.name = 'Camera Parent'
        if (this.scene) {
            this.scene.removeObject(this);
            this.scene.addObject(parent);
        }

        parent.rotation.copy(target.object3D.rotation);

        parent.addChild(this);
        this.translate(this.followOffset);
        this.parent = parent;
    }

    update(time?: number) {
        super.update(time);

        if (this.followTarget && this.parent) {
            this.parent.position.copy(this.followTarget.position);
        }

        if (this.lookAtTarget) {
            this.camera.lookAt(this.lookAtTarget.position);
        }
    }
}
