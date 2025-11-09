export interface Disposable {
    dispose(): Promise<void> | void;
}

type FunctionType = (...args: any[]) => any;

export function isDisposable(value: any): value is Disposable {
    if (typeof value.dispose !== "function") return false;

    const disposeFun: FunctionType = value.dispose;

    // `.dispose()` takes in no arguments
    if (disposeFun.length > 0) {
        return false;
    }

    return true;
}
