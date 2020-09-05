import {GameObject} from "./GameObject";
import {
    Material,
    AnimationClip,
    AnimationMixer,
    SkeletonHelper,
    AnimationAction,
    Event
} from "three";

export class AnimatedGameObject extends GameObject {
    animationActions: Map<string, AnimationAction> = new Map<string, AnimationAction>();

    private mixer?: AnimationMixer;
    private skeleton?: SkeletonHelper;

    start() {
        super.start();

        if (this.scene && this.skeleton) {
            this.scene.getScene().add(this.skeleton)
        }
    }

    destroy() {
        super.destroy();
        if (this.skeleton && this.scene) {
            this.scene.getScene().remove(this.skeleton);
            this.skeleton.geometry.dispose();
            if (this.skeleton.material instanceof Material) {
                this.skeleton.material.dispose();
            }
        }
    }

    async loadGLTF(modelPath: string) {
        let gltf = await super.loadGLTF(modelPath);
        if (gltf) {
            this.loadAnimations(gltf);
        }
    }

    async loadFBX(modelPath: string): Promise<void> {
        let fbx = await super.loadFBX(modelPath);
        if (fbx) {
            this.loadAnimations(fbx);
        }
    }

    private loadAnimations(object: { animations?: AnimationClip[] }) {

        if (Array.isArray(object.animations) && object.animations.length) {
            const mixer = new AnimationMixer(this.object3D);
            object.animations.forEach(clip => {
                this.animationActions.set(clip.name, mixer.clipAction(clip))
            })
            this.mixer = mixer;
        }

        this.skeleton = new SkeletonHelper(this.object3D)
        this.skeleton.visible = false

        this.activateAllActions();
    }

    private getAction(animation: string) {
        const action = this.animationActions.get(animation)
        if (!action) throw new Error(`Could not find animation ${animation}, available animations are ${this.animationActions.keys()}`)
        return action
    }

    crossFadeAnimationImmediate(start: string, end: string, duration: number = 0) {
        const startAction = this.getAction(start);
        const endAction = this.getAction(end);
        this.executeCrossFade(startAction, endAction, duration);
    }

    crossFadeAnimation(start: string, end: string, duration: number) {
        const startAction = this.getAction(start);
        const endAction = this.getAction(end);
        this.synchronizeCrossFade(startAction, endAction, duration);
    }

    private setWeight(action: AnimationAction, weight: number) {
        action.enabled = true;
        action.setEffectiveWeight(weight);
    }

    public getWeight(animation: string) {
        const action = this.getAction(animation);
        return action.getEffectiveWeight();
    }

    setTimeScale(animation: string, scale: number) {
        this.getAction(animation).setEffectiveTimeScale(scale)
    }

    private executeCrossFade(startAction: AnimationAction,
                             endAction: AnimationAction,
                             duration: number) {
        this.setWeight(endAction, 1);

        endAction.time = 0;
        startAction.crossFadeTo(endAction, duration, true)
    }

    private synchronizeCrossFade(startAction: AnimationAction,
                                 endAction: AnimationAction,
                                 duration: number) {
        let mixer = this.mixer;
        if (!mixer) return

        const onLoopFinished = (event: Event) => {
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
