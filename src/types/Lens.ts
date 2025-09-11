import type { BrowserNativeObject, FieldValues } from 'react-hook-form';

import type { ArrayLens } from './ArrayLens';
import type { HookFormControlShim } from './Interop';
import type { ObjectLens } from './ObjectLens';
import type { PrimitiveLens } from './PrimitiveLens';
import type { Toolkit } from './toolkit';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LensBase<T> extends Toolkit<T> {}

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
export type Lens<T> = LensBase<T> & LensSelector<T>;

/**
 * Why not use `T extends any[] ...`, instead of `[T] extends [any[]]`?:
 * Because of @see {@link https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types}
 *
 * This allows using discriminated unions for T.
 * For an example of what problem this solves:
 * @see {@link https://github.com/react-hook-form/lenses/issues/16}
 */
export type LensSelector<T> = [T] extends [any[]]
  ? ArrayLens<T>
  : [T] extends [FieldValues]
    ? ObjectLens<T>
    : [T] extends [boolean | true | false]
      ? PrimitiveLens<boolean>
      : [T] extends [null | undefined]
        ? never
        : PrimitiveLens<T>;

export type LensesDictionary<T> = {
  [P in keyof T]: Lens<T[P]>;
};

export type RecursiveLensesDictionary<T> = {
  [P in keyof T]: Lens<T[P]> | RecursiveLensesDictionary<T[P]>;
}
export type LensesGetter<T> = RecursiveLensesDictionary<T> | Lens<T>;

export type UnwrapLens<T> = T extends BrowserNativeObject
  ? T
  : T extends HookFormControlShim<any>
    ? unknown
    : T extends (infer U)[]
      ? UnwrapLens<U>[]
      : T extends Lens<infer U>
        ? UnwrapLens<U>
        : T extends object
          ? { [P in keyof T]: UnwrapLens<T[P]> }
          : T;
