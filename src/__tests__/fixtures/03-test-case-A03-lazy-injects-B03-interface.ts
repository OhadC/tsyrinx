import { registry } from "../../decorators";
import { inject } from "../../injectors";
import { delay } from "../../lazy-helpers";
import { B03, Ib03 } from "./03-test-case-B03-lazy-injects-A03-interface";

export interface Ia03 {
    name: string;
}

@registry([
    {
        token: "Ib03",
        useToken: delay(() => B03),
    },
])
export class A03 implements Ia03 {
    public b = inject<Ib03>("Ib03");

    public name = "A03";
}
