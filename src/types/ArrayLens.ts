import type { Path, PathValue } from 'react-hook-form';

import type { Lens, LensesDictionary, LensesGetter, UnwrapLens } from './Lens';

export interface ArrayLensReflectGetter<T, R> {
  (dictionary: LensesDictionary<T>, lens: Lens<T>): [LensesGetter<R>];
}

export interface ArrayLensMapper<T, R> {
  (value: T, lens: Lens<T>, index: number, array: T[], origin: this): R;
}

export interface ArrayLens<T extends any[]> {
  focus<P extends Path<T>>(path: P): Lens<PathValue<T, P>>;
  focus<P extends number>(path: P): Lens<T[P]>;
  reflect<R>(getter: ArrayLensReflectGetter<T[number], R>): Lens<UnwrapLens<R>[]>;
  map<F extends T, R>(fields: F, mapper: ArrayLensMapper<F[number], R>): R[];
}
