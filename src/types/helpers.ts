import type { FieldValues } from 'react-hook-form';

import type { Lens, NonObjectFieldShim } from './lenses';

export type LensesMap<T> = {
  [key in keyof T]: Lens<T[key]>;
};

export type LensesValues<T> = T extends FieldValues
  ? {
      [key in keyof T]: Lens<T[key]>;
    }
  : Lens<T>;

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
