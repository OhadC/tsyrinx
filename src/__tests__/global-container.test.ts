/* eslint-disable @typescript-eslint/no-empty-function */
import { injectable, registry, singleton } from "../decorators";
import { instance as globalContainer } from "../dependency-container";
import { instanceCachingFactory, instancePerContainerCachingFactory, predicateAwareClassFactory } from "../factories";
import { inject, injectAll } from "../injectors";
import { ValueProvider } from "../providers";
import { DependencyContainer } from "../types";
import { Disposable } from "../types/disposable";
import { Lifecycle } from "../types/lifecycle";

interface IBar {
    value: string;
}

afterEach(() => {
    globalContainer.reset();
});

// --- registerSingleton() ---

test("a singleton registration can be redirected", () => {
    @singleton()
    class MyService {}

    class MyServiceMock {}

    class MyClass {
        public myService = inject(MyService);
    }

    globalContainer.registerSingleton(MyService, MyServiceMock);
    const myClass = globalContainer.resolve(MyClass);

    expect(myClass.myService).toBeInstanceOf(MyServiceMock);
});

// --- resolve() ---

test("fails to resolve unregistered dependency by name", () => {
    expect(() => {
        globalContainer.resolve("NotRegistered");
    }).toThrow();
});

test("allows arrays to be registered by value provider", () => {
    class Bar {}

    const value = [new Bar()];
    globalContainer.register<Bar[]>("BarArray", { useValue: value });

    const barArray = globalContainer.resolve<Bar[]>("BarArray");
    expect(Array.isArray(barArray)).toBeTruthy();
    expect(value === barArray).toBeTruthy();
});

test("allows arrays to be registered by factory provider", () => {
    class Bar {}

    globalContainer.register<Bar>(Bar, { useClass: Bar });
    globalContainer.register<Bar[]>("BarArray", {
        useFactory: (container): Bar[] => {
            return [container.resolve(Bar)];
        },
    });

    const barArray = globalContainer.resolve<Bar[]>("BarArray");
    expect(Array.isArray(barArray)).toBeTruthy();
    expect(barArray.length).toBe(1);
    expect(barArray[0]).toBeInstanceOf(Bar);
});

test("resolves transient instances when not registered", () => {
    class Bar {}

    const myBar = globalContainer.resolve(Bar);
    const myBar2 = globalContainer.resolve(Bar);

    expect(myBar instanceof Bar).toBeTruthy();
    expect(myBar2 instanceof Bar).toBeTruthy();
    expect(myBar).not.toBe(myBar2);
});

test("resolves a transient instance when registered by class provider", () => {
    class Bar {}
    globalContainer.register("Bar", { useClass: Bar });

    const myBar = globalContainer.resolve<Bar>("Bar");
    const myBar2 = globalContainer.resolve<Bar>("Bar");

    expect(myBar instanceof Bar).toBeTruthy();
    expect(myBar2 instanceof Bar).toBeTruthy();
    expect(myBar).not.toBe(myBar2);
});

test("resolves a singleton instance when class provider registered as singleton", () => {
    class Bar {}
    globalContainer.register("Bar", { useClass: Bar }, { lifecycle: Lifecycle.Singleton });

    const myBar = globalContainer.resolve<Bar>("Bar");
    const myBar2 = globalContainer.resolve<Bar>("Bar");

    expect(myBar instanceof Bar).toBeTruthy();
    expect(myBar).toBe(myBar2);
});

test("resolves a transient instance when using token alias", () => {
    class Bar {}
    globalContainer.register("Bar", { useClass: Bar });
    globalContainer.register("BarAlias", { useToken: "Bar" });

    const myBar = globalContainer.resolve<Bar>("BarAlias");
    const myBar2 = globalContainer.resolve<Bar>("BarAlias");

    expect(myBar instanceof Bar).toBeTruthy();
    expect(myBar).not.toBe(myBar2);
});

test("resolves a singleton instance when token alias registered as singleton", () => {
    class Bar {}
    globalContainer.register("Bar", { useClass: Bar });
    globalContainer.register("SingletonBar", { useToken: "Bar" }, { lifecycle: Lifecycle.Singleton });

    const myBar = globalContainer.resolve<Bar>("SingletonBar");
    const myBar2 = globalContainer.resolve<Bar>("SingletonBar");

    expect(myBar instanceof Bar).toBeTruthy();
    expect(myBar).toBe(myBar2);
});

test("resolves same instance when registerInstance() is used with a class", () => {
    class Bar {}
    const instance = new Bar();
    globalContainer.registerInstance(Bar, instance);

    expect(globalContainer.resolve(Bar)).toBe(instance);
});

test("resolves same instance when registerInstance() is used with a name", () => {
    class Bar {}
    const instance = new Bar();
    globalContainer.registerInstance("Test", instance);

    expect(globalContainer.resolve("Test")).toBe(instance);
});

test("registerType() allows for classes to be swapped", () => {
    class Bar {}
    class Foo {}
    globalContainer.registerType(Bar, Foo);

    expect(globalContainer.resolve<Foo>(Bar) instanceof Foo).toBeTruthy();
});

test("registerType() allows for names to be registered for a given type", () => {
    class Bar {}
    globalContainer.registerType("CoolName", Bar);

    expect(globalContainer.resolve<Bar>("CoolName") instanceof Bar).toBeTruthy();
});

test("registerType() doesn't allow tokens to point to themselves", () => {
    expect(() => globalContainer.registerType("Bar", "Bar")).toThrow("Token registration cycle detected!");
});

test("registerType() doesn't allow registration cycles", () => {
    globalContainer.registerType("Bar", "Foo");
    globalContainer.registerType("Foo", "FooBar");

    expect(() => globalContainer.registerType("FooBar", "Bar")).toThrow("Token registration cycle detected!");
});

test("executes a registered factory each time resolve is called", () => {
    const factoryMock = jest.fn();
    globalContainer.register("Test", { useFactory: factoryMock });

    globalContainer.resolve("Test");
    globalContainer.resolve("Test");

    expect(factoryMock.mock.calls.length).toBe(2);
});

test("resolves to factory result each time resolve is called", () => {
    const factoryMock = jest.fn();
    globalContainer.register("Test", { useFactory: factoryMock });
    const value1 = 1;
    const value2 = 2;

    factoryMock.mockReturnValue(value1);
    const result1 = globalContainer.resolve("Test");
    factoryMock.mockReturnValue(value2);
    const result2 = globalContainer.resolve("Test");

    expect(result1).toBe(value1);
    expect(result2).toBe(value2);
});

test("resolves anonymous classes separately", () => {
    const ctor1 = (() => class {})();
    const ctor2 = (() => class {})();

    globalContainer.registerInstance(ctor1, new ctor1());
    globalContainer.registerInstance(ctor2, new ctor2());

    expect(globalContainer.resolve(ctor1) instanceof ctor1).toBeTruthy();
    expect(globalContainer.resolve(ctor2) instanceof ctor2).toBeTruthy();
});
test("resolves dependencies of superclass", () => {
    class Dependency {}

    class SuperClass {
        public dependency = inject(Dependency);
    }

    class SubClass extends SuperClass {}

    expect(globalContainer.resolve(SubClass).dependency).toBeInstanceOf(Dependency);
});
// --- resolveAll() ---

test("fails to resolveAll unregistered dependency by name", () => {
    expect(() => {
        globalContainer.resolveAll("NotRegistered");
    }).toThrow();
});

test("resolves an array of transient instances bound to a single interface", () => {
    interface FooInterface {
        bar: string;
    }

    class FooOne implements FooInterface {
        public bar = "foo1";
    }

    class FooTwo implements FooInterface {
        public bar = "foo2";
    }

    globalContainer.register<FooInterface>("FooInterface", {
        useClass: FooOne,
    });
    globalContainer.register<FooInterface>("FooInterface", {
        useClass: FooTwo,
    });

    const fooArray = globalContainer.resolveAll<FooInterface>("FooInterface");
    expect(Array.isArray(fooArray)).toBeTruthy();
    expect(fooArray[0]).toBeInstanceOf(FooOne);
    expect(fooArray[1]).toBeInstanceOf(FooTwo);
});

test("resolves all transient instances when not registered", () => {
    class Foo {}

    const foo1 = globalContainer.resolveAll<Foo>(Foo);
    const foo2 = globalContainer.resolveAll<Foo>(Foo);

    expect(Array.isArray(foo1)).toBeTruthy();
    expect(Array.isArray(foo2)).toBeTruthy();
    expect(foo1[0]).toBeInstanceOf(Foo);
    expect(foo2[0]).toBeInstanceOf(Foo);
    expect(foo1[0]).not.toBe(foo2[0]);
});

test("resolves all dependencies that provided an additional token in the  decorator", () => {
    interface Bar {
        value(): string;
    }

    @injectable({ token: "Bar" })
    class Foo implements Bar {
        value(): string {
            return "foo";
        }
    }

    const foo = globalContainer.resolveAll<Bar>("Bar");
    expect(Array.isArray(foo)).toBeTruthy();
    expect(foo[0] instanceof Foo).toBeTruthy();
});

test("resolves all dependencies that provided additional tokens in the  decorator", () => {
    interface Bar {
        value(): string;
    }

    interface TestInterface {
        test(): string;
    }

    @injectable({ token: ["Bar", "TestInterface"] })
    class Foo implements Bar, TestInterface {
        value(): string {
            return "foo";
        }

        test(): string {
            return "test";
        }
    }

    const foo = globalContainer.resolveAll<Bar>("Bar");
    expect(Array.isArray(foo)).toBeTruthy();
    expect(foo[0] instanceof Foo).toBeTruthy();

    const foo2 = globalContainer.resolveAll<TestInterface>("TestInterface");
    expect(Array.isArray(foo2)).toBeTruthy();
    expect(foo2[0] instanceof Foo).toBeTruthy();
});

test("resolves all dependencies that provided additional tokens in the  decorator", () => {
    interface Bar {
        value(): string;
    }

    @injectable({ token: "Bar" })
    class Foo implements Bar {
        value(): string {
            return "foo";
        }
    }

    @injectable({ token: "Bar" })
    class Baz implements Bar {
        value(): string {
            return "baz";
        }
    }

    const bars = globalContainer.resolveAll<Bar>("Bar");
    expect(Array.isArray(bars)).toBeTruthy();
    expect(bars.length).toBe(2);
    expect(bars[0] instanceof Foo).toBeTruthy();
    expect(bars[1] instanceof Baz).toBeTruthy();
});

// --- isRegistered() ---

test("returns true for a registered singleton class", () => {
    class Bar implements IBar {
        public value = "";
    }

    class Foo {
        public myBar = inject(Bar);
    }
    globalContainer.registerSingleton(Foo);

    expect(globalContainer.isRegistered(Foo)).toBeTruthy();
});

test("returns true for a registered class provider", () => {
    class Bar implements IBar {
        public value = "";
    }

    class Foo {
        public myBar = inject(Bar);
    }
    globalContainer.register(Foo, { useClass: Foo });

    expect(globalContainer.isRegistered(Foo)).toBeTruthy();
});

test("returns true for a registered value provider", () => {
    class Bar implements IBar {
        public value = "";
    }

    class Foo {
        public myBar = inject(Bar);
    }
    globalContainer.register(Foo, { useValue: {} } as ValueProvider<any>);

    expect(globalContainer.isRegistered(Foo)).toBeTruthy();
});

test("returns true for a registered token provider", () => {
    class Bar implements IBar {
        public value = "";
    }

    class Foo {
        public myBar = inject(Bar);
    }
    globalContainer.register(Foo, { useToken: "Bar" });

    expect(globalContainer.isRegistered(Foo)).toBeTruthy();
});

// --- clearInstances() ---

test("clears ValueProvider registrations", () => {
    class Foo {}
    const instance1 = new Foo();
    globalContainer.registerInstance("Test", instance1);

    expect(globalContainer.resolve("Test")).toBeInstanceOf(Foo);

    globalContainer.clearInstances();

    expect(() => {
        globalContainer.resolve("Test");
    }).toThrow();
});

test("clears cached instances from container.resolve() calls", () => {
    @singleton()
    class Foo {}
    const instance1 = globalContainer.resolve(Foo);

    globalContainer.clearInstances();

    // Foo should still be registered as singleton
    const instance2 = globalContainer.resolve(Foo);
    const instance3 = globalContainer.resolve(Foo);

    expect(instance1).not.toBe(instance2);
    expect(instance2).toBe(instance3);
    expect(instance3).toBeInstanceOf(Foo);
});

// --- @singleton ---

test("@singleton registers class as singleton with the global container", () => {
    @singleton()
    class Bar {}

    const myBar = globalContainer.resolve(Bar);
    const myBar2 = globalContainer.resolve(Bar);

    expect(myBar instanceof Bar).toBeTruthy();
    expect(myBar).toBe(myBar2);
});

test("dependencies of an @singleton can be resolved", () => {
    class Foo {}

    @singleton()
    class Bar {
        public foo = inject(Foo);
    }

    const myBar = globalContainer.resolve(Bar);

    expect(myBar.foo instanceof Foo).toBeTruthy();
});

// --- @registry ---

test("doesn't blow up with empty args", () => {
    @registry()
    class RegisteringFoo {}

    expect(() => new RegisteringFoo()).not.toThrow();
});

test("registers by type provider", () => {
    class Bar implements IBar {
        public value = "";
    }
    @registry([{ token: Bar, useClass: Bar }])
    class RegisteringFoo {}

    new RegisteringFoo();

    expect(globalContainer.isRegistered(Bar)).toBeTruthy();
});

test("registers by class provider", () => {
    class Bar implements IBar {
        public value = "";
    }
    const registration = {
        token: "IBar",
        useClass: Bar,
    };

    @registry([registration])
    class RegisteringFoo {}

    new RegisteringFoo();

    expect(globalContainer.isRegistered(registration.token)).toBeTruthy();
});

test("registers by value provider", () => {
    const registration = {
        token: "IBar",
        useValue: {},
    };

    @registry([registration])
    class RegisteringFoo {}

    new RegisteringFoo();

    expect(globalContainer.isRegistered(registration.token)).toBeTruthy();
});

test("registers by token provider", () => {
    const registration = {
        token: "IBar",
        useToken: "IFoo",
    };

    @registry([registration])
    class RegisteringFoo {}

    new RegisteringFoo();

    expect(globalContainer.isRegistered(registration.token)).toBeTruthy();
});

test("registers by factory provider", () => {
    class Bar implements IBar {
        public value = "";
    }

    const registration = {
        token: "IBar",
        useFactory: (globalContainer: DependencyContainer) => globalContainer.resolve(Bar),
    };

    @registry([registration])
    class RegisteringFoo {}

    new RegisteringFoo();

    expect(globalContainer.isRegistered(registration.token)).toBeTruthy();
});

test("registers mixed types", () => {
    class Bar implements IBar {
        public value = "";
    }

    class Foo {
        public myBar = inject(Bar);
    }

    const registration = {
        token: "IBar",
        useClass: Bar,
    };

    @registry([registration, { token: Foo, useClass: Foo }])
    class RegisteringFoo {}

    new RegisteringFoo();

    expect(globalContainer.isRegistered(registration.token)).toBeTruthy();
    expect(globalContainer.isRegistered(Foo)).toBeTruthy();
});

test("registers by symbol token provider", () => {
    const registration = {
        token: Symbol("obj1"),
        useValue: {},
    };

    @registry([registration])
    class RegisteringFoo {}

    new RegisteringFoo();

    expect(globalContainer.isRegistered(registration.token)).toBeTruthy();
    expect(globalContainer.resolve(registration.token)).toEqual(registration.useValue);
});

// --- @inject ---

test("allows interfaces to be resolved from 'inject' with injection token", () => {
    class Bar implements IBar {
        public value = "";
    }

    @registry([{ token: Bar, useClass: Bar }])
    class FooWithInterface {
        public myBar = inject<IBar>(Bar);
    }

    const myFoo = globalContainer.resolve(FooWithInterface);

    expect(myFoo.myBar instanceof Bar).toBeTruthy();
});

test("allows interfaces to be resolved from 'inject' with just a name", () => {
    class Bar implements IBar {
        public value = "";
    }

    @registry([
        {
            token: "IBar",
            useClass: Bar,
        },
    ])
    class FooWithInterface {
        public myBar = inject<IBar>("IBar");
    }

    const myFoo = globalContainer.resolve(FooWithInterface);

    expect(myFoo.myBar instanceof Bar).toBeTruthy();
});
test("allows for optional injection", () => {
    class FooWithInterface {
        public myBar? = inject<IBar>("IBar", { isOptional: true });
    }

    const myFoo = globalContainer.resolve(FooWithInterface);

    expect(myFoo).toBeDefined();
    expect(myFoo.myBar).toBeUndefined();
});

test("allows explicit array dependencies to be resolved by inject decorator", () => {
    class Foo {}

    class Bar {
        public foo = inject<Foo[]>("FooArray");
    }

    const fooArray = [new Foo()];
    globalContainer.register<Foo[]>("FooArray", { useValue: fooArray });
    globalContainer.register<Bar>(Bar, { useClass: Bar });

    const bar = globalContainer.resolve<Bar>(Bar);
    expect(bar.foo === fooArray).toBeTruthy();
});

// --- @injectAll ---

test("injects all dependencies bound to a given interface", () => {
    interface Foo {
        str: string;
    }

    class FooImpl1 implements Foo {
        public str = "foo1";
    }

    class FooImpl2 implements Foo {
        public str = "foo2";
    }

    class Bar {
        public foo = injectAll<Foo>("Foo");
    }

    globalContainer.register<Foo>("Foo", { useClass: FooImpl1 });
    globalContainer.register<Foo>("Foo", { useClass: FooImpl2 });

    const bar = globalContainer.resolve<Bar>(Bar);
    expect(Array.isArray(bar.foo)).toBeTruthy();
    expect(bar.foo.length).toBe(2);
    expect(bar.foo[0]).toBeInstanceOf(FooImpl1);
    expect(bar.foo[1]).toBeInstanceOf(FooImpl2);
});

test("does not throw when injecting all dependencies bound to a given interface if the isOptional property is set to true", () => {
    interface Foo {
        str: string;
    }

    class Bar {
        public foo = injectAll<Foo>("Foo", { isOptional: true });
    }

    const bar = globalContainer.resolve<Bar>(Bar);
    expect(Array.isArray(bar.foo)).toBeTruthy();
    expect(bar.foo.length).toBe(0);
});

test("allows array dependencies to be resolved if a single instance is in the container", () => {
    class Foo {}

    class Bar {
        public foo = injectAll<Foo>(Foo);
    }
    globalContainer.register<Foo>(Foo, { useClass: Foo });
    globalContainer.register<Bar>(Bar, { useClass: Bar });

    const bar = globalContainer.resolve<Bar>(Bar);
    expect(bar.foo.length).toBe(1);
});

// --- factories ---

test("instanceCachingFactory caches the returned instance", () => {
    const factory = instanceCachingFactory(() => {});

    expect(factory(globalContainer)).toBe(factory(globalContainer));
});

test("instanceCachingFactory caches the returned instance even when there is branching logic in the factory", () => {
    const instanceA = {};
    const instanceB = {};
    let useA = true;

    const factory = instanceCachingFactory(() => (useA ? instanceA : instanceB));

    expect(factory(globalContainer)).toBe(instanceA);
    useA = false;
    expect(factory(globalContainer)).toBe(instanceA);
});

test("instancePerContainerCachingFactory caches the returned instance", () => {
    const factory = instancePerContainerCachingFactory(() => {});

    expect(factory(globalContainer)).toBe(factory(globalContainer));
});

test("instancePerContainerCachingFactory caches the returned instance even when there is branching logic in the factory", () => {
    const instanceA = {};
    const instanceB = {};
    let useA = true;

    const factory = instancePerContainerCachingFactory(() => (useA ? instanceA : instanceB));

    expect(factory(globalContainer)).toBe(instanceA);
    useA = false;
    expect(factory(globalContainer)).toBe(instanceA);
});

test("instancePerContainerCachingFactory returns the correct instance per container", () => {
    const instanceA = {};
    const instanceB = {};
    let useA = true;

    const factory = instancePerContainerCachingFactory(() => (useA ? instanceA : instanceB));

    expect(factory(globalContainer)).toBe(instanceA);
    useA = false;
    expect(factory(globalContainer.createChildContainer())).toBe(instanceB);
});

test("predicateAwareClassFactory correctly switches the returned instance with caching on", () => {
    class A {}
    class B {}
    let useA = true;
    const factory = predicateAwareClassFactory(() => useA, A, B);

    expect(factory(globalContainer) instanceof A).toBeTruthy();
    useA = false;
    expect(factory(globalContainer) instanceof B).toBeTruthy();
});

test("predicateAwareClassFactory returns the same instance each call with caching on", () => {
    class A {}
    class B {}
    const factory = predicateAwareClassFactory(() => true, A, B);

    expect(factory(globalContainer)).toBe(factory(globalContainer));
});

test("predicateAwareClassFactory correctly switches the returned instance with caching off", () => {
    class A {}
    class B {}
    let useA = true;
    const factory = predicateAwareClassFactory(() => useA, A, B, false);

    expect(factory(globalContainer) instanceof A).toBeTruthy();
    useA = false;
    expect(factory(globalContainer) instanceof B).toBeTruthy();
});

test("predicateAwareClassFactory returns new instances each call with caching off", () => {
    class A {}
    class B {}
    const factory = predicateAwareClassFactory(() => true, A, B, false);

    expect(factory(globalContainer)).not.toBe(factory(globalContainer));
});

describe("dispose", () => {
    class Foo implements Disposable {
        disposed = false;
        dispose(): void {
            this.disposed = true;
        }
    }
    class Bar implements Disposable {
        disposed = false;
        dispose(): void {
            this.disposed = true;
        }
    }
    class Baz implements Disposable {
        disposed = false;
        async dispose(): Promise<void> {
            return new Promise(resolve => {
                process.nextTick(() => {
                    this.disposed = true;
                    resolve();
                });
            });
        }
    }

    it("renders the container useless", () => {
        const container = globalContainer.createChildContainer();
        container.dispose();

        expect(() => container.register("Bar", { useClass: Bar })).toThrow(/disposed/);
        expect(() => container.reset()).toThrow(/disposed/);
        expect(() => container.resolve("indisposed")).toThrow(/disposed/);
    });

    it("disposes all child disposables", () => {
        const container = globalContainer.createChildContainer();

        const foo = container.resolve(Foo);
        const bar = container.resolve(Bar);

        container.dispose();

        expect(foo.disposed).toBeTruthy();
        expect(bar.disposed).toBeTruthy();
    });

    it("disposes asynchronous disposables", async () => {
        const container = globalContainer.createChildContainer();

        const foo = container.resolve(Foo);
        const baz = container.resolve(Baz);

        await container.dispose();

        expect(foo.disposed).toBeTruthy();
        expect(baz.disposed).toBeTruthy();
    });

    it("disposes all instances of the same type", () => {
        const container = globalContainer.createChildContainer();

        const foo1 = container.resolve(Foo);
        const foo2 = container.resolve(Foo);

        container.dispose();

        expect(foo1.disposed).toBeTruthy();
        expect(foo2.disposed).toBeTruthy();
    });

    it("doesn't dispose of instances created external to the container", () => {
        const foo = new Foo();
        const container = globalContainer.createChildContainer();

        container.registerInstance(Foo, foo);
        container.resolve(Foo);
        container.dispose();

        expect(foo.disposed).toBeFalsy();
    });
});
