import type { FieldArray, FieldArrayPath, FieldArrayWithId, FieldValues, Path, PathValue } from 'react-hook-form';

import type { HookFormControlShim, LensInteropBinding, ShimKeyName } from './Interop';
import type { Lens, LensesDictionary, LensesGetter, UnwrapLens } from './Lens';

export interface ArrayLensGetter<T, R> {
  (dictionary: LensesDictionary<T>, lens: Lens<T>): [LensesGetter<R>];
}

export interface ArrayLensMapper<T, L, R> {
  (value: T, lens: Lens<L>, index: number, array: T[], origin: this): R;
}

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
  focus<P extends Path<T>>(path: P): Lens<PathValue<T, P>>;
  focus<P extends number>(path: P): Lens<T[P]>;
  reflect<R>(getter: ArrayLensGetter<T[number], R>): Lens<UnwrapLens<R>[]>;
  map<F extends T, R>(fields: F, mapper: ArrayLensMapper<F[number], T[number], R>): R[];
  interop(): LensInteropTransformerBinding<
    HookFormControlShim<T>,
    ShimKeyName extends FieldArrayPath<HookFormControlShim<T>> ? ShimKeyName : never
  >;
}
