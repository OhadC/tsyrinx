import { ClassProvider, isClassProvider } from "./class-provider";
import { FactoryProvider, isFactoryProvider } from "./factory-provider";
import { TokenProvider, isTokenProvider } from "./token-provider";
import { ValueProvider, isValueProvider } from "./value-provider";

export type Provider<T = any> =
  | ClassProvider<T>
  | ValueProvider<T>
  | TokenProvider<T>
  | FactoryProvider<T>;

export function isProvider(provider: any): provider is Provider {
  return (
    isClassProvider(provider) ||
    isValueProvider(provider) ||
    isTokenProvider(provider) ||
    isFactoryProvider(provider)
  );
}

