import type { Lens } from './Lens';

export interface Toolkit<T> {
  /**
   * Create a *new* lens that is narrowed to the union variant identified by the
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
  narrow<K extends keyof T, V extends T[K]>(key: K, value: V): Lens<Extract<T, Record<K, V>>>;

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
  assert<K extends keyof T, V extends T[K]>(key: K, value: V): asserts this is Lens<Extract<T, Record<K, V>>>;
}
