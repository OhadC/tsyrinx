import { instance as globalContainer } from "../dependency-container";
import { inject } from "../injectors";
import { A01 } from "./fixtures/01-test-case-A01-injects-B01";
import { errorMatch } from "./utils/error-match";

afterEach(() => {
    globalContainer.reset();
});

test("Param position", () => {
    class A {
        public j = inject("missing");
    }

    expect(() => {
        globalContainer.resolve(A);
    }).toThrow(errorMatch([/Attempted to resolve unregistered dependency token: "missing"/]));
});

test("Detect circular dependency", () => {
    expect(() => {
        globalContainer.resolve(A01);
    }).toThrow(errorMatch([/Maximum call stack size exceeded/]));
});
