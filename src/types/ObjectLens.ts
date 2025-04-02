import type { Path, PathValue } from 'react-hook-form';

import type { Lens, LensesDictionary, LensesGetter, UnwrapLens } from './Lens';

export interface ObjectLensGetter<T, R> {
  (dictionary: LensesDictionary<T>, lens: Lens<T>): LensesGetter<R>;
}

export interface ObjectLens<T> {
  focus<P extends Path<T>>(path: P): Lens<PathValue<T, P>>;
  reflect<R>(getter: ObjectLensGetter<T, R>): Lens<UnwrapLens<R>>;
}
