import type { Lens, NonObjectFieldShim } from './lenses';

export type LensesMap = {
  [key: string]: Lens<[] | object | string | number | boolean | undefined | null>;
};

export type LensesDeepMap = {
  [key: string]: Lens<[] | object | string | number | boolean | undefined | null> | LensesDeepMap;
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
