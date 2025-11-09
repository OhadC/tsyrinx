import type { InjectionToken } from "./injection-token";
import type { Provider } from "./provider";

export interface TokenProvider<T> {
    useToken: InjectionToken<T>;
}

export function isTokenProvider<T>(provider: Provider<T>): provider is TokenProvider<any> {
    return !!(provider as TokenProvider<T>).useToken;
}
