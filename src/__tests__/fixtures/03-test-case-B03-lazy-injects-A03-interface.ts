import { registry } from "../../decorators";
import { inject } from "../../injectors";
import { delay } from "../../lazy-helpers";
import { A03, Ia03 } from "./03-test-case-A03-lazy-injects-B03-interface";

export interface Ib03 {
    name: string;
}

@registry([
    {
        token: "Ia03",
        useToken: delay(() => A03),
    },
])
export class B03 implements Ib03 {
    public a = inject<Ia03>("Ia03");

    public name = "B03";
}
