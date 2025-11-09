import { container } from "..";
import { injectAllWithTransform, injectWithTransform } from "../injectors";
import { Transform } from "../types/transform";

afterEach(() => {
    container.reset();
});

test("Injecting with transform should work", () => {
    class Bar {}

    class BarTransform {
        public transform(): string {
            return "Transformed from bar";
        }
    }

    class Foo {
        public value = injectWithTransform(Bar, BarTransform);
    }

    const result = container.resolve(Foo);

    expect(result.value).toEqual("Transformed from bar");
});

test("Injecting with transform should work passing a parameter from the decorator", () => {
    class Bar {
        public repeat(str: string): string {
            return str + str;
        }
    }

    class BarTransform implements Transform<Bar, string, [string]> {
        public transform(bar: Bar, str: string): string {
            return bar.repeat(str);
        }
    }

    class Foo {
        public value = injectWithTransform(Bar, BarTransform, "b");
    }

    const result = container.resolve(Foo);

    expect(result.value).toEqual("bb");
});

test("Injecting with transform should work passing parameters from the decorator", () => {
    class Bar {
        public concat(str1: string, str2: string): string {
            return str1 + str2;
        }
    }

    class BarTransform implements Transform<Bar, string, [string, string]> {
        public transform(bar: Bar, str1: string, str2: string): string {
            return bar.concat(str1, str2);
        }
    }

    class Foo {
        public value = injectWithTransform(Bar, BarTransform, "a", "b");
    }

    const result = container.resolve(Foo);

    expect(result.value).toEqual("ab");
});

test("Injecting all with transform should work", () => {
    class Bar {}

    class BarTransform {
        public transform(): string {
            return "Transformed from bar";
        }
    }

    class Foo {
        public value = injectAllWithTransform(Bar, BarTransform);
    }

    const result = container.resolve(Foo);

    expect(result.value).toEqual("Transformed from bar");
});

test("Injecting all with transform should allow the transformer to act over an array", () => {
    interface FooInterface {
        bar: string;
    }

    class FooOne implements FooInterface {
        public bar = "foo1";
    }

    class FooTwo implements FooInterface {
        public bar = "foo2";
    }

    container.register<FooInterface>("FooInterface", { useClass: FooOne });
    container.register<FooInterface>("FooInterface", { useClass: FooTwo });

    class FooTransform implements Transform<FooInterface[], string> {
        public transform(foos: FooInterface[]): string {
            return foos.map(f => f.bar).reduce((acc, f) => acc + f);
        }
    }

    class Bar {
        public value = injectAllWithTransform("FooInterface", FooTransform);
    }

    const result = container.resolve(Bar);

    expect(result.value).toEqual("foo1foo2");
});

test("Injecting all with transform should work with a decorator parameter", () => {
    interface FooInterface {
        bar: string;
    }

    class FooOne implements FooInterface {
        public bar = "foo1";
    }

    class FooTwo implements FooInterface {
        public bar = "foo2";
    }

    container.register<FooInterface>("FooInterface", { useClass: FooOne });
    container.register<FooInterface>("FooInterface", { useClass: FooTwo });

    class FooTransform implements Transform<FooInterface[], string, [string]> {
        public transform(foos: FooInterface[], suffix: string): string {
            return foos.map(f => f.bar + suffix).reduce((acc, f) => acc + f);
        }
    }

    class Bar {
        public value = injectAllWithTransform("FooInterface", FooTransform, "!!");
    }

    const result = container.resolve(Bar);

    expect(result.value).toEqual("foo1!!foo2!!");
});

test("Injecting all with transform should allow multiple decorator params", () => {
    interface FooInterface {
        bar: string;
    }

    class FooOne implements FooInterface {
        public bar = "foo1";
    }

    class FooTwo implements FooInterface {
        public bar = "foo2";
    }

    container.register<FooInterface>("FooInterface", { useClass: FooOne });
    container.register<FooInterface>("FooInterface", { useClass: FooTwo });

    class FooTransform implements Transform<FooInterface[], string, [string, string]> {
        public transform(foos: FooInterface[], delimiter: string, suffix: string): string {
            return foos.map(f => f.bar + delimiter).reduce((acc, f) => acc + f) + suffix;
        }
    }

    class Bar {
        public value = injectAllWithTransform("FooInterface", FooTransform, ",", "!!");
    }

    const result = container.resolve(Bar);

    expect(result.value).toEqual("foo1,foo2,!!");
});
