import type { Lens, NonObjectFieldShim } from './lenses';

export type LensesMap<T> = {
  [key in keyof T]: Lens<T[key]>;
};

export type LensesDeepMap<T> = {
  [key: string]: Lens<T> | LensesDeepMap<T>;
};

export type UnwrapLens<T> =
  T extends NonObjectFieldShim<any>
    ? unknown
    : T extends (infer U)[]
      ? UnwrapLens<U>[]
      : T extends Lens<infer U>
        ? UnwrapLens<U>
        : T extends object
          ? { [P in keyof T]: UnwrapLens<T[P]> }
          : T;
