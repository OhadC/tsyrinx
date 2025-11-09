import { instance as globalContainer } from "../dependency-container";
import type { InjectionToken } from "../providers/injection-token";
import type { Provider } from "../providers/provider";
import type { RegistrationOptions } from "../types/registration-options";

/**
 * Class decorator factory that allows constructor dependencies to be registered at runtime.
 *
 * @return {Function} The class decorator
 */
export function registry(
    registrations: ({
        token: InjectionToken;
        options?: RegistrationOptions;
    } & Provider<any>)[] = [],
): (target: any) => any {
    return function (target: any): any {
        registrations.forEach(({ token, options, ...provider }) => globalContainer.register(token, provider as any, options));

        return target;
    };
}
