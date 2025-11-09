[![Build Status](https://github.com/OhadC/tsyrinx/actions/workflows/build-and-test.yml/badge.svg?branch=main)](https://github.com/OhadC/tsyrinx/actions)
[![NPM Version](https://img.shields.io/npm/v/tsyrinx)](https://www.npmjs.com/package/tsyrinx)
[![NPM Downloads](https://img.shields.io/npm/dt/tsyrinx)](https://www.npmjs.com/package/tsyrinx)

# TSyrinx

A lightweight **dependency injection** container for TypeScript and JavaScript  
— compatible with both **ECMAScript** and **TypeScript legacy decorators**,  
and **no longer requires `reflect-metadata`**.

> **Forked from [Microsoft/tsyringe](https://github.com/microsoft/tsyringe)**  
> TSyrinx is a modern rework and simplification of TSyringe with enhanced decorator support and a zero-reflect-metadata runtime.

---

## Key Differences from TSyringe

- **No `reflect-metadata` required**  
  (TSyrinx uses decorator context and type inference instead.)
- **Supports both decorators conventions**  
  Works with **ECMAScript decorators** (Stage 3) and **TypeScript legacy decorators**.
- **Removed decorators**  
  `autoInjectable`, `injectAllWithTransform`, `injectAll`, `injectWithTransform`, and `inject` (as decorators) were removed.
- **Simplified `@injectable`**  
  Only accepts `options: { token?: InjectionToken<T> | InjectionToken<T>[] }`.
- **New runtime injection methods**  
  Added functions:
    - `inject(token: InjectionToken<T>, options?)`
    - `injectWithTransform(token, transform, ...args)`
    - `injectAll(token, options?)`
    - `injectAllWithTransform(token, transform, ...args)`

---

## Installation

Install via npm or pnpm:

```bash
npm install tsyrinx
# or
pnpm add tsyrinx
```

Update your `tsconfig.json` to enable decorators (legacy or new):

```json
{
    "compilerOptions": {
        "experimentalDecorators": true
    }
}
```

> You do **not** need `"emitDecoratorMetadata": true` or `reflect-metadata`.

---

## Quick Example

```typescript
import { container, injectable } from "tsyrinx";

class Database {}

class Foo {
    public db = inject(Database);
}

const foo = container.resolve(Foo);
console.log(foo.db instanceof Database); // ✅ true
```

Or using an explicit token:

```typescript
@injectable({ token: "DB" })
class Database {}

class Foo {
    db = inject<Database>("DB");
}

const foo = container.resolve(Foo);
```

---

## 🧱 API

### `@injectable(options)`

Register a class with one or more tokens.

```typescript
@injectable({ token: ["FooService", "AnotherAlias"] })
class Foo {}
```

### `@singleton()`

Registers the class as a singleton within the global container.

```typescript
@singleton()
class Foo {}
```

### `@scoped(lifecycle)`

Registers a class with a specific lifecycle (same as TSyringe):

- `Lifecycle.Transient` (default)
- `Lifecycle.Singleton`
- `Lifecycle.ResolutionScoped`
- `Lifecycle.ContainerScoped`

```typescript
@scoped(Lifecycle.ContainerScoped)
class ScopedFoo {}
```

---

## Injection Helpers

Instead of parameter decorators, TSyrinx exposes **runtime injection functions**
to be called anywhere (constructor, method, factory, etc.):

```typescript
import { inject, injectAll, injectWithTransform } from "tsyrinx";

class Foo {
    db = inject(Database);
    allRepos = injectAll("Repository");
    config = injectWithTransform("Config", cfg => cfg.env);
}
```

These helpers respect all container scopes and tokens.

---

## Container API

The container API follows the same principles as TSyringe.

### Register

```typescript
container.register(Foo, { useClass: Foo });
container.register("Config", { useValue: { env: "dev" } });
```

### Resolve

```typescript
const foo = container.resolve(Foo);
const config = container.resolve("Config");
```

### Resolve All

```typescript
const allRepos = container.resolveAll("Repository");
```

### IsRegistered

```typescript
container.isRegistered(Foo); // true
```

### Child Containers

```typescript
const child = container.createChildContainer();
child.register(Foo, { useClass: Foo });
```

### Clearing Instances

```typescript
container.clearInstances();
```

---

## Circular Dependencies

Circular dependencies are supported via the `delay` helper:

```typescript
import { delay, inject } from "tsyrinx";

class Foo {
    public bar = inject(delay(() => Bar));
}

class Bar {
    public foo = inject(delay(() => Foo));
}
```

---

## Disposable Instances

All instances implementing `Disposable` are disposed automatically when calling:

```typescript
await container.dispose();
```

---

## Example

```typescript
import { container, inject, injectable } from "tsyrinx";

class Database {
    connect() {
        console.log("DB connected");
    }
}

class App {
    db = inject(Database);

    run() {
        this.db.connect();
    }
}

container.resolve(App).run();
```

---

## Non-Goals

- Property injection decorators (e.g. `@inject` on fields)
- Metadata reflection (`reflect-metadata`)
- Legacy decorator metadata dependency

---

## Acknowledgments

TSyrinx is a **fork and rework of [Microsoft/tsyringe](https://github.com/microsoft/tsyringe)**.
All credit to the original authors for their excellent foundation.
TSyrinx aims to modernize and simplify dependency injection for the new decorators world.

---

## Contributing

Contributions are welcome!
If you find a bug or want to suggest improvements, open an issue or PR.

---

**MIT License**
Copyright © 2025 Ohad Cohen
