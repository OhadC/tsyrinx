import { Provider } from "./provider";

export interface ValueProvider<T> {
    useValue: T;
}

export function isValueProvider<T>(provider: Provider<T>): provider is ValueProvider<T> {
    return (provider as ValueProvider<T>).useValue != undefined;
}
