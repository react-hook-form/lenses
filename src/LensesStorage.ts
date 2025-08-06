import type { Control, FieldValues } from 'react-hook-form';

import type { LensCore } from './LensCore';

export type LensesStorageComplexKey = (...args: any[]) => any;

export interface LensesStorageValue<T extends FieldValues> {
  plain?: LensCore<T>;
  complex: WeakMap<LensesStorageComplexKey, LensCore<T>>;
}

export type LensCache<T extends FieldValues> = Map<string, LensesStorageValue<T>>;

/**
 * Cache storage for lenses.
 */
export class LensesStorage<T extends FieldValues> {
  protected cache: LensCache<T>;

  constructor(control: Control<T>) {
    this.cache = new Map();
    control._subscribe({
      formState: {
        values: true,
      },
      exact: true,
      callback: () => {
        control._names.unMount.forEach((name) => {
          this.delete(name);
        });
      },
    });
  }

  public get(path: string, complexKey?: LensesStorageComplexKey): LensCore<T> | undefined {
    const cached = this.cache.get(path);

    if (cached) {
      if (complexKey) {
        return cached.complex.get(complexKey);
      }

      return cached.plain;
    }

    return undefined;
  }

  public set(lens: LensCore<T>, path: string, complexKey?: LensesStorageComplexKey): void {
    let cached = this.cache.get(path);

    if (!cached) {
      cached = {
        complex: new WeakMap(),
      };

      this.cache.set(path, cached);
    }

    if (complexKey) {
      cached.complex.set(complexKey, lens);
    } else {
      cached.plain = lens;
    }
  }

  public has(path: string, complexKey?: LensesStorageComplexKey): boolean {
    if (complexKey) {
      return this.cache.get(path)?.complex.has(complexKey) ?? false;
    }

    return this.cache.has(path);
  }

  public delete(path: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(path)) {
        this.cache.delete(key);
      }
    }
  }

  public clear(): void {
    this.cache.clear();
  }
}
