type Service = 'camera' | 'renderer' | 'scene' | 'canvas' | 'physics';

export class ServiceLocator {
    private container: Map<Service, any> = new Map<Service, any>()

    static get instance(): ServiceLocator {
        if (!this._instance) {
            this._instance = new ServiceLocator()
        }

        return this._instance;
    }

    private static _instance: ServiceLocator;

    static setService(serviceName: Service , service: any) {
        this.instance.container.set(serviceName, service);
    }

    static getService<T>(serviceName: Service) {
        return this.instance.container.get(serviceName) as T;
    }

}
