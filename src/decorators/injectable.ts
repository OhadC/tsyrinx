import { instance as globalContainer } from "../dependency-container";
import { InjectionToken } from "../providers/injection-token";
import { constructor } from "../types/constructor";

/**
 * Class decorator factory that allows the class' dependencies to be injected
 * at runtime.
 *
 * @return {Function} The class decorator
 */
export function injectable<T>(options?: {
  token?: InjectionToken<T> | InjectionToken<T>[];
}): (target: constructor<T>) => void {
  return function(target: constructor<T>): void {
    if (options && options.token) {
      if (!Array.isArray(options.token)) {
        globalContainer.register(options.token, target);
      } else {
        options.token.forEach(token => {
          globalContainer.register(token, target);
        });
      }
    }
  };
}
