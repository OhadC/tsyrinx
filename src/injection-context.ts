import { ResolutionContext } from "./resolution-context";
import { DependencyContainer } from "./types";

export class InjectionContext {
    private static currentDependencyContainer: DependencyContainer | null = null;
    private static currentResolutionContext: ResolutionContext | null = null;

    public static runWithContext<T>(container: DependencyContainer, resolutionContext: ResolutionContext, fn: () => T): T {
        const previousContainer = this.currentDependencyContainer;
        this.currentDependencyContainer = container;

        const previousResolutionContext = this.currentResolutionContext;
        this.currentResolutionContext = resolutionContext;

        try {
            return fn();
        } finally {
            this.currentDependencyContainer = previousContainer;
            this.currentResolutionContext = previousResolutionContext;
        }
    }

    public static getCurrentDependencyContainer(): DependencyContainer | null {
        return this.currentDependencyContainer;
    }

    public static getCurrentResolutionContext(): ResolutionContext | null {
        return this.currentResolutionContext;
    }
}
