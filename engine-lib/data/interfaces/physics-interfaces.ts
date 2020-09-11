import {GameObject} from "../GameObject";
import Ammo from "ammojs-typed";

export type ColliderType = 'box' | 'cylinder' | 'cone' | 'sphere' | 'capsule'

interface RigidBodySettingsBase {
    type: ColliderType
    mass: number
    object?: GameObject
    group?: number
    mask?: number
    rollingFriction?: number
    restitution?: number
    friction?: number
    margin?: number
    isDynamic?: boolean
    isKinematic?: boolean,
    isStatic?: boolean,
    noContactResponse?: boolean,
    isCharacter?: boolean
}

interface ConeRigidBodySettings extends RigidBodySettingsBase {
    type: 'cone'
    radius: number
    height: number
}

interface CylinderRigidBodySettings extends RigidBodySettingsBase {
    type: 'cylinder'
    radius: number
    height: number
}

interface BoxRigidBodySettings extends RigidBodySettingsBase {
    type: 'box'
    sx: number
    sy: number
    sz: number
}

interface CapsuleRigidBodySettings extends RigidBodySettingsBase {
    type: 'capsule'
    radius: number
    height: number
}

interface SphereRigidBodySettings extends RigidBodySettingsBase {
    type: 'sphere'
    radius: number
}

export type RigidBodySettings =
    SphereRigidBodySettings
    | BoxRigidBodySettings
    | CylinderRigidBodySettings
    | ConeRigidBodySettings
    | CapsuleRigidBodySettings


export interface CollisionData {
    object0: CollisionObjectData
    object1: CollisionObjectData
    isOfTags: (tag0: string, tag1: string) => boolean
    involvesName: (name: string) => boolean;
}

interface CollisionObjectData {
    object: GameObject
    worldPosition: Ammo.btVector3
    localPosition: Ammo.btVector3
}
