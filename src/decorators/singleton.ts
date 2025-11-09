import { instance as globalContainer } from "../dependency-container";
import { constructor } from "../types/constructor";

/**
 * Class decorator factory that registers the class as a singleton within
 * the global container.
 *
 * @return {Function} The class decorator
 */
export function singleton<T>(): (target: constructor<T>) => void {
    return function (target: constructor<T>): void {
        globalContainer.registerSingleton(target);
    };
}
