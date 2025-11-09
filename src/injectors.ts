import { InjectionContext } from "./injection-context";
import { InjectionToken } from "./providers";
import { Transform } from "./types";

export function inject<T>(token: InjectionToken<T>, options?: { isOptional?: boolean }): T {
    const container = InjectionContext.getCurrentDependencyContainer();
    const context = InjectionContext.getCurrentResolutionContext();
    if (!container || !context) {
        throw new Error("No current dependency container is set. Make sure to call runWithDependencyContainer to set a container.");
    }

    return container.resolve(token, context, options?.isOptional);
}

export function injectWithTransform<TIn, TOut, TArgs extends any[] = []>(
    token: InjectionToken<TIn>,
    transformerToken: InjectionToken<Transform<TIn, TOut, TArgs>>,
    ...args: TArgs
): TOut {
    const transformer = inject(transformerToken);
    const transformedValue = transformer.transform(inject(token), ...args);

    return transformedValue;
}

export function injectAll<T>(token: InjectionToken<T>, options?: { isOptional?: boolean }): T[] {
    const container = InjectionContext.getCurrentDependencyContainer();
    const context = InjectionContext.getCurrentResolutionContext();
    if (!container || !context) {
        throw new Error("No current dependency container is set. Make sure to call runWithDependencyContainer to set a container.");
    }

    return container.resolveAll(token, context, options?.isOptional);
}

export function injectAllWithTransform<TIn, UOut, TArgs extends any[] = []>(
    token: InjectionToken<TIn>,
    transformerToken: InjectionToken<Transform<TIn[], UOut, TArgs>>,
    ...args: TArgs
): UOut {
    const transformer = inject(transformerToken);
    const transformedValue = transformer.transform(injectAll(token), ...args);

    return transformedValue;
}
