import {GameObject} from "./GameObject";
import {ModelLoader} from "./ModelLoader";
import * as THREE from "three";

export class AnimatedGameObject extends GameObject {
    animationActions: Map<string, THREE.AnimationAction> = new Map<string, THREE.AnimationAction>();

    private mixer?: THREE.AnimationMixer;
    private skeleton?: THREE.SkeletonHelper;

    start() {
        super.start();

        if (this.scene && this.skeleton) {
            this.scene.getScene().add(this.skeleton)
        }
    }

    async loadGLTF(modelPath: string): Promise<void> {
        let gltf = await ModelLoader.loadGltf(modelPath);
        this.object3D = gltf.scene;

        this.loadAnimations(gltf);
    }

    async loadFBX(modelPath: string): Promise<void> {
        let fbx = await ModelLoader.loadFbx(modelPath);
        this.object3D = fbx;

        this.loadAnimations(fbx);

        this.object3D.traverse(child => {
            if (child instanceof THREE.Mesh) {
                let material = child.material;
                if (material instanceof THREE.MeshPhongMaterial) {
                    material.shininess = 0;
                    material.color = new THREE.Color('#fff')
                    material.specular = new THREE.Color('#fff')
                }
            }
        })
    }

    private loadAnimations(object: { animations?: THREE.AnimationClip[] }) {

        if (Array.isArray(object.animations) && object.animations.length) {
            const mixer = new THREE.AnimationMixer(this.object3D);
            object.animations.forEach(clip => {
                this.animationActions.set(clip.name, mixer.clipAction(clip))
            })
            this.mixer = mixer;
        }

        this.skeleton = new THREE.SkeletonHelper(this.object3D)
        this.skeleton.visible = false

        this.activateAllActions();
    }

    private getAction(animation: string) {
        const action = this.animationActions.get(animation)
        if (!action) throw new Error(`Could not find animation ${animation}`)
        return action
    }

    crossFadeAnimationImmediate(start: string, end: string, duration: number) {
        const startAction = this.getAction(start);
        const endAction = this.getAction(end);
        this.executeCrossFade(startAction, endAction, duration);
    }

    crossFadeAnimation(start: string, end: string, duration: number) {
        const startAction = this.getAction(start);
        const endAction = this.getAction(end);
        this.synchronizeCrossFade(startAction, endAction, duration);
    }

    private setWeight(action: THREE.AnimationAction, weight: number) {
        action.enabled = true;
        action.setEffectiveTimeScale(1);
        action.setEffectiveWeight(weight);
    }

    setTimeScale(animation: string, scale: number) {
        this.getAction(animation).setEffectiveTimeScale(scale)
    }

    private executeCrossFade(startAction: THREE.AnimationAction, endAction: THREE.AnimationAction, duration: number) {
        this.setWeight(endAction, 1);

        endAction.time = 0;
        startAction.crossFadeTo(endAction, duration, true)
    }

    private synchronizeCrossFade(startAction: THREE.AnimationAction, endAction: THREE.AnimationAction, duration: number) {
        let mixer = this.mixer;
        if (!mixer) return

        const onLoopFinished = (event: THREE.Event) => {
            if (event.action === startAction) {
                mixer?.removeEventListener('loop', onLoopFinished)

                this.executeCrossFade(startAction, endAction, duration)
            }
        }

        mixer.addEventListener('loop', onLoopFinished)
    }

    playAnimation(animation: string) {
        let action = this.getAction(animation);
        this.setWeight(action, 1);
        action.play();
    }

    stopAnimation(animation: string) {
        let action = this.getAction(animation);
        this.setWeight(action, 0);
        action.stop();
    }

    private activateAllActions() {
        this.animationActions.forEach(action => {
            this.setWeight(action, 0)
            action.play()
        })
    }

    update(time: number) {
        super.update(time);

        if (this.mixer) {
            this.mixer.update(time)
        }
    }

    stopAllAnimations() {
        this.animationActions.forEach(action => action.stop())
    }
}
