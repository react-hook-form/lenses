import type { Lens, LensesGetter, UnwrapLens } from './Lens';

export interface PrimitiveLensGetter<T, R> {
  /**
   * A primitive lens restructures function.
   *
   * @param dictionary - Since primitive values has no key-value pairs, the dictionary is always `never`.
   * @param lens - Current primitive lens.
   */
  (dictionary: never, lens: Lens<T>): LensesGetter<R>;
}

export interface PrimitiveLens<T> {
  /**
   * This method allows you to create a new lens with different shape.
   *
   * @param getter - A function that returns an object where each field is a lens.
   *
   * @example
   * ```tsx
   * function Component({ lens }: { lens: Lens<string> }) {
   *   return <Inside lens={lens.reflect((_, l) => ({ data: l }))} />;
   * }
   *
   * function Inside({ lens }: { lens: Lens<{ data: string }> }) {
   *   return <StringInput label="Data" lens={lens.focus('data')} />;
   * }
   * ```
   */
  reflect<R>(getter: PrimitiveLensGetter<T, R>): Lens<UnwrapLens<R>>;
}
