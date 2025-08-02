import type { FieldValues } from 'react-hook-form';

import type { ArrayLens } from './ArrayLens';
import type { HookFormControlShim, LensInterop } from './Interop';
import type { ObjectLens } from './ObjectLens';
import type { PrimitiveLens } from './PrimitiveLens';

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

/**
 * Makes `Lens<T>` behave covariantly with respect to its value type `T`.
 *
 * Why is this needed?
 * TypeScript treats generic parameters in **intersection** types as
 * invariant.  A lens therefore keeps its exact value-type, but that also
 * means `Lens<Dog>` is NOT assignable to `Lens<Dog | Cat>`.
 *
 * Trick:
 * 1.  Keep the precise interop arm — `LensInterop<Exclude<T, null | undefined>>`
 *     so APIs like `useController(lens.interop())` still infer the exact
 *     field value type.
 * 2.  Add a second, *widened* arm — `LensInterop<any>`.
 *     Because intersections are **structural**, this extra property list
 *     makes the whole type compatible with any broader union while not
 *     changing runtime behaviour (both arms describe the same shape).
 *
 * Result: `Lens<Dog>`   ⊑  `Lens<Dog | Cat>`
 *         yet `lens.interop()` still returns `Control<Dog>` rather than
 *         `Control<any>`.
 */
type CovariantLensInterop<T> = LensInterop<Exclude<T, null | undefined>> & LensInterop<any>;

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
export type Lens<T> = CovariantLensInterop<T> & LensSelector<T>;

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
