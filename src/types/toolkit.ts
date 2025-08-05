import type { Lens } from './Lens';

export interface Toolkit<T> {
  /**
   * Manual narrowing helper – lets you tell the type system what branch of the
   * union you want without providing a discriminant property/value. This is
   * effectively a *type-level cast* that narrows the lens type so you
   * can continue chaining:
   *
   * ```ts
   * const maybe = lens.focus('optional');        // Lens<string | undefined>
   * const defined = maybe.narrow<string>();      // Lens<string>
   * ```
   *
   * Use it when you already know (by external logic) that the value is of a
   * specific subtype – e.g. you validated it, or are inside a branch guarded by
   * your own runtime check.
   */
  narrow<R extends T>(): Lens<R>;

  /**
   * Narrow the lens type to the union variant identified by the
   * discriminant tuple `(key, value)`.
   *
   * Example
   * ```ts
   * // T is Dog | Cat
   * const dogLens = lens.narrow('type', 'dog'); // Lens<Dog>
   * ```
   *
   * @param key    – name of the discriminant property (e.g. `'type'`)
   * @param value  – literal value that selects the desired branch (e.g. `'dog'`)
   */
  // Discriminant-based narrowing (objects & tagged unions)
  narrow<K extends keyof T, V extends T[K]>(key: K, value: V): Lens<Extract<T, Record<K, V>>>;

  /**
   * Manual assertion counterpart – convinces TypeScript that **`this`** lens is
   * already the desired subtype `R`.
   *
   * Unlike the discriminant overload it takes **no arguments** – you just
   * specify the generic parameter:
   *
   * ```ts
   * function needsString(l: Lens<string>) {}
   * maybeLens.assert<string>();
   * needsString(maybeLens);   // now ok
   * ```
   *
   * Prefer the zero-arg overload when you are in a code branch proven by custom
   * runtime checks or external guarantees.
   */
  assert<R extends T>(): asserts this is Lens<R>;

  /**
   * Assert that the current lens is already narrowed to the branch
   * `{ [key]: value }`.
   *
   * Useful in `if`/`switch` statements when you do not need a separate variable:
   * ```ts
   * if (selected.type === 'cat') {
   *   lens.assert('type', 'cat');
   *   //  ↳ within this block lens is Lens<Cat>
   * }
   * ```
   *
   * @param key    – discriminant property name
   * @param value  – discriminant literal value
   */
  // Discriminant form
  assert<K extends keyof T, V extends T[K]>(key: K, value: V): asserts this is Lens<Extract<T, Record<K, V>>>;

  /**
   * Narrow the lens type to exclude `null` and `undefined`.
   *
   * Example:
   * ```ts
   * const maybeLens = lens.focus('optional');  // Lens<string | null | undefined>
   * const definedLens = maybeLens.defined();   // Lens<string>
   * ```
   *
   * This is equivalent to using `narrow<NonNullable<T>>()` but provides a more
   * convenient and expressive API for the common case of excluding nullish values.
   *
   * Use this when you know (by external logic) that the value is not null or
   * undefined - e.g. you validated it, or are inside a branch guarded by your
   * own runtime check.
   */
  defined(): Lens<NonNullable<T>>;

  /**
   * Forcefully changes the lens type to a new type `R`, regardless of its
   * compatibility with the original type `T`.
   *
   * This is a powerful and potentially **unsafe** operation. Unlike `narrow`,
   * `cast` does not require the new type to be a subtype of the original. It's
   * a blunt tool for situations where you, the programmer, have more
   * information than the type system and need to force a type change.
   *
   * **Use with extreme caution.** It can lead to runtime errors if the
   * underlying data does not match the asserted type `R`.
   *
   * Example:
   * ```ts
   * // T is some type, e.g. `any` or `unknown`
   * declare const lens: Lens<T>;
   * const stringLens = lens.cast<string>(); // Now Lens<string>
   * ```
   *
   * @template R The new type to cast the lens to.
   */
  cast<R>(): Lens<R>;
}
