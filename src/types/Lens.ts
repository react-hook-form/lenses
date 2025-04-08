import type { FieldValues } from 'react-hook-form';

import type { ArrayLens } from './ArrayLens';
import type { HookFormControlShim, LensInterop } from './Interop';
import type { ObjectLens } from './ObjectLens';
import type { PrimitiveLens } from './PrimitiveLens';

/**
 * This is a type that allows you to hold the type of a form element.
 *
 * ```ts
 * type LensWithArray = Lens<string[]>;
 * type LensWithObject = Lens<{ name: string; age: number }>;
 * type LensWithPrimitive = Lens<string>;
 * ```
 *
 * In runtime it has `control` and `name` to use latter in react-hook-form.
 * Each time you do `lens.focus('propPath')` it creates a lens that keeps nesting of paths.
 */
export type Lens<T> = LensInterop<T> & (T extends any[] ? ArrayLens<T> : T extends FieldValues ? ObjectLens<T> : PrimitiveLens<T>);

export type LensesDictionary<T> = {
  [P in keyof T]: Lens<T[P]>;
};

export type LensesGetter<T> = LensesDictionary<T> | Lens<T>;

export type UnwrapLens<T> =
  T extends HookFormControlShim<any>
    ? unknown
    : T extends (infer U)[]
      ? UnwrapLens<U>[]
      : T extends Lens<infer U>
        ? UnwrapLens<U>
        : T extends object
          ? { [P in keyof T]: UnwrapLens<T[P]> }
          : T;
