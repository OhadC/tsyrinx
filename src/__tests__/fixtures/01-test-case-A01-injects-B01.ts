import { inject } from "../../injectors";
import { B01 } from "./01-test-case-B01-injects-A01";

export class A01 {
    public b = inject(B01);
}
