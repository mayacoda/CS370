import {ServiceLocator} from "./ServiceLocator";

export class GameStorage {

    constructor() {
        ServiceLocator.setService<GameStorage>('storage', this);
    }

    getItem(key: string) {
        return localStorage.getItem(key);
    }

    setItem(key: string, item: any) {
        localStorage.setItem(key, item);
    }

    removeItem(key:string) {
        localStorage.removeItem(key);
    }

    clear() {
        localStorage.clear();
    }
}
