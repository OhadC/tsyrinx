export type Transform<TIn, TOut, TArgs extends any[] = []> = {
    transform: (incoming: TIn, ...args: TArgs) => TOut;
};
