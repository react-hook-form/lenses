import type { Path, PathValue } from 'react-hook-form';

import type { Lens, LensesDictionary, LensesGetter, UnwrapLens } from './Lens';

export interface ObjectLensGetter<T, R> {
  /**
   * An object lens restructures function.
   *
   * @param dictionary - It is a proxy which focuses a lens on property read.
   * @param lens - Current object lens.
   */
  (dictionary: LensesDictionary<T>, lens: Lens<T>): LensesGetter<R>;
}

export interface ObjectLens<T> {
  /**
   * This method allows you to create a new lens that focuses on a specific field in the form.
   *
   * @param path - The path to the field in the form.
   *
   * @example
   * ```tsx
   * function App() {
   *   const { control, handleSubmit } = useForm<{
   *     firstName: string;
   *     some: { nested: { field: string } };
   *     arr: { value: string }[];
   *   }>();
   *
   *   const lens = useLens({ control });
   *
   *   return (
   *     <form onSubmit={handleSubmit(console.log)}>
   *       <StringInput lens={lens.focus('firstName')} />
   *       <StringInput lens={lens.focus('some.nested.field')} />
   *       <StringInput lens={lens.focus('arr.0.value')} />
   *       <input type="submit" />
   *     </form>
   *   );
   * }
   *
   * function StringInput({ lens }: { lens: Lens<string> }) {
   *   return <input {...lens.interop((ctrl, name) => ctrl.register(name))} />;
   * }
   * ```
   */
  focus<P extends Path<T>>(path: P): Lens<PathValue<T, P>>;

  /**
   * This method allows you to create a new lens with different shape.
   *
   * @param getter - A function that returns an object where each field is a lens.
   *
   * @example
   * ```tsx
   * function Component({ lens }: { lens: Lens<{ firstName: string; lastName: string; age: number }> }) {
   *   return (
   *     <SharedComponent
   *       lens={lens.reflect(({ firstName, lastName, ...rest }) => ({
   *         ...rest,
   *         name: firstName,
   *         surname: lastName,
   *       }))}
   *     />
   *   );
   * }
   * function SharedComponent({ lens }: { lens: Lens<{ name: string; surname: string; age: number }> }) {
   *   return (
   *     <div>
   *       <StringInput lens={lens.focus('name')} />
   *       <StringInput lens={lens.focus('surname')} />
   *       <NumberInput lens={lens.focus('age')} />
   *     </div>
   *   );
   * }
   * ```
   */
  reflect<R>(getter: ObjectLensGetter<T, R>): Lens<UnwrapLens<R>>;
}
