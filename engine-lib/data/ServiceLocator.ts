type Service = 'camera' | 'renderer' | 'scene' | 'canvas' | 'physics' | 'gameState' | 'storage' | 'audio';

export interface GameState {
    isPaused: boolean
    debug: boolean
}

export class ServiceLocator {
    private container: Map<Service, any> = new Map<Service, any>()

    static get instance(): ServiceLocator {
        if (!this._instance) {
            this._instance = new ServiceLocator()
        }

        return this._instance;
    }

    private static _instance: ServiceLocator;

    static setService<T extends any>(serviceName: Service , service: T) {
        this.instance.container.set(serviceName, service);
    }

    static getService<T>(serviceName: Service) {
        return this.instance.container.get(serviceName) as T;
    }

}
