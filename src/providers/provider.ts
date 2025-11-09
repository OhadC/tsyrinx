import { isClassProvider, type ClassProvider } from "./class-provider";
import { isFactoryProvider, type FactoryProvider } from "./factory-provider";
import { isTokenProvider, type TokenProvider } from "./token-provider";
import { isValueProvider, type ValueProvider } from "./value-provider";

export type Provider<T = any> = ClassProvider<T> | ValueProvider<T> | TokenProvider<T> | FactoryProvider<T>;

export function isProvider(provider: any): provider is Provider {
    return isClassProvider(provider) || isValueProvider(provider) || isTokenProvider(provider) || isFactoryProvider(provider);
}
