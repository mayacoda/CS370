import {ServiceLocator} from "../../engine-lib/data/ServiceLocator";
import {GameStorage} from "../../engine-lib/data/GameStorage";

export function updateHighScore(key: string, time: number) {
    const storage = ServiceLocator.getService<GameStorage>('storage');

    const currentScore = storage.getItem(key);

    if (!currentScore || parseInt(currentScore) > time) {
        storage.setItem(key, time);
    }
}

export function formatTime(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0')
}
