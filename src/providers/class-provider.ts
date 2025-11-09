import { DelayedConstructor } from "../lazy-helpers";
import { type constructor } from "../types/constructor";
import { type Provider } from "./provider";

export interface ClassProvider<T> {
    useClass: constructor<T> | DelayedConstructor<T>;
}

export function isClassProvider<T>(provider: Provider<T>): provider is ClassProvider<any> {
    return !!(provider as ClassProvider<T>).useClass;
}
