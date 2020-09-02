import {GameObject} from "../GameObject";
import {ColliderType} from "../PhysicsEngine";
import Ammo from "ammojs-typed";

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

interface SphereRigidBodySettings extends RigidBodySettingsBase {
    type: 'sphere'
    radius: number
}

export type RigidBodySettings =
    SphereRigidBodySettings
    | BoxRigidBodySettings
    | CylinderRigidBodySettings
    | ConeRigidBodySettings


export interface CollisionData {
    object0: CollisionObjectData
    object1: CollisionObjectData
    isOfTags: (tag0: string, tag1: string) => boolean
}

interface CollisionObjectData {
    object: GameObject,
    velocity: Ammo.btVector3
    worldPosition: Ammo.btVector3
    localPosition: Ammo.btVector3
}
