import { inject } from "../../injectors";
import { delay } from "../../lazy-helpers";
import { B02 } from "./02-test-case-B02-lazy-injects-A02";

export class A02 {
    public b = inject(delay(() => B02));
}
