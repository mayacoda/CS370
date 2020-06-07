export function getExtension(path: string) {
    let result = /^.*(\.[a-z]+)$/.exec(path);
    if (Array.isArray(result) && result.length > 1) return result[1]
    return null
}

export function isAcceptedModelExtension(ext: string): ext is AcceptedModelExtensions {
    return Object.values(AcceptedModelExtensions).includes(ext as AcceptedModelExtensions)
}

export enum AcceptedModelExtensions {
    Obj = '.obj',
    Gltf = '.gltf',
    Fbx = '.fbx'
}
