import { inject, injectable, registry } from "../../decorators";
import { delay } from "../../lazy-helpers";
import { B03, Ib03 } from "./03-test-case-B03-lazy-injects-A03-interface";

export interface Ia03 {
    name: string;
}

@injectable()
@registry([
    {
        token: "Ib03",
        useToken: delay(() => B03),
    },
])
export class A03 implements Ia03 {
    public name = "A03";
    constructor(@inject("Ib03") public b: Ib03) {}
}
