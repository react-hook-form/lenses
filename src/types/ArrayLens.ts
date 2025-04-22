import type { FieldArray, FieldArrayPath, FieldArrayWithId, FieldValues, Path, PathValue } from 'react-hook-form';

import type { HookFormControlShim, LensInteropBinding, ShimKeyName } from './Interop';
import type { Lens, LensesDictionary, LensesGetter, UnwrapLens } from './Lens';

export interface ArrayLensGetter<T, R> {
  (dictionary: LensesDictionary<T>, lens: Lens<T>): [LensesGetter<R>];
}

export interface ArrayLensMapper<T, L, R> {
  (value: T, lens: Lens<L>, index: number, array: T[], origin: this): R;
}

/**
 * Array item transformers for `useFieldArray` from @hookform/lenses.
 */
export interface LensInteropTransformerBinding<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id',
> extends LensInteropBinding<TFieldValues, ShimKeyName> {
  getTransformer?: <R extends TFieldValues, N extends FieldArrayPath<R>>(
    value: FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>,
  ) => FieldArrayWithId<R, N, TKeyName>;

  setTransformer?: <R extends FieldValues, N extends FieldArrayPath<R>>(
    value: FieldArray<R, N>,
  ) => FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>;
}

export interface ArrayLens<T extends any[]> {
  /**
   * This method allows you to create a new lens with specific path starting from the array item.
   *
   * @param path - The path to the field in the form.
   *
   * @example
   * ```tsx
   * function Component({ lens }: { lens: Lens<{ name: string }[]> }) {
   *   const firstName = lens.focus('0.name');
   *   const secondItem = lens.focus('1');
   *   // ...
   * }
   * ```
   */
  focus<P extends Path<T>>(path: P): Lens<PathValue<T, P>>;

  /** This method allows you to create a new lens that focuses on a specific array item.
   *
   * @param index - Array index to focus on.
   *
   * @example
   * ```tsx
   * function Component({ lens }: { lens: Lens<{ name: string }[]> }) {
   *   const thirdItem = lens.focus(2);
   *   /// ...
   * }
   * ```
   */
  focus<P extends number>(index: P): Lens<T[P]>;

  /**
   * This method allows you to restructure the array item.
   * Pay attention that this function must return an array with one item.
   *
   * @param getter - A function that returns an array with one object where each field is a lens.
   *
   * @example
   * ```tsx
   * function Component({
   *   lens,
   * }: {
   *   lens: Lens<{
   *     items: {
   *       value: { inside: string };
   *     }[];
   *   }>;
   * }) {
   *   return <Items lens={lens.focus('items').reflect(({ value }) => [{ data: value.focus('inside') }])} />;
   * }
   *
   * function Items({ lens }: { lens: Lens<{ data: string }[]> }) {
   *   const { fields } = useFieldArray(lens.interop());
   *
   *   return (
   *     <div>
   *       {lens.map(fields, (value, l) => (
   *         <div key={value.id}>
   *           <StringInput label="Value" lens={l.focus('data')} />
   *         </div>
   *       ))}
   *     </div>
   *   );
   * }
   * ```
   */
  reflect<R>(getter: ArrayLensGetter<T[number], R>): Lens<UnwrapLens<R>[]>;

  /**
   * This method allows you to map an array lens.
   * It requires the `fields` property from `useFieldArray`.
   *
   * @param fields - The `fields` property from `useFieldArray`.
   * @param mapper - A function that will be called on each `fields` item.
   *
   * @example
   * ```tsx
   * function Component({ lens }: { lens: Lens<{ data: string }[]> }) {
   *   const { fields } = useFieldArray(lens.interop());
   *
   *   return (
   *     <div>
   *       {lens.map(fields, (value, l) => (
   *         <div key={value.id}>
   *           <StringInput label="Value" lens={l.focus('data')} />
   *         </div>
   *       ))}
   *     </div>
   *   );
   * }
   * ```
   */
  map<F extends T, R>(fields: F, mapper: ArrayLensMapper<F[number], T[number], R>): R[];

  /**
   * This method returns `name` and `control` properties from react-hook-form.
   * The returned object must be passed to `useFieldArray` hook from `@hookform/lenses`.
   *
   * @example
   * ```tsx
   * import { useFieldArray } from '@hookform/lenses/rhf';
   *
   * function Component({ lens }: { lens: Lens<{ data: string }[]> }) {
   *   const { fields } = useFieldArray(lens.interop());
   *
   *   return (
   *     <div>
   *       {lens.map(fields, (value, l) => (
   *         <div key={value.id}>
   *           <StringInput label="Value" lens={l.focus('data')} />
   *         </div>
   *       ))}
   *     </div>
   *   );
   * }
   * ```
   */
  interop(): LensInteropTransformerBinding<
    HookFormControlShim<Exclude<T, null | undefined>>,
    ShimKeyName extends FieldArrayPath<HookFormControlShim<Exclude<T, null | undefined>>> ? ShimKeyName : never
  >;
}
