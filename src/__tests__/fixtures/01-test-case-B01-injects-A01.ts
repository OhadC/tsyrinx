import { inject } from "../../injectors";
import { A01 } from "./01-test-case-A01-injects-B01";

export class B01 {
    public a = inject(A01);
}
