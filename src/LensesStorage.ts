import type { Control, FieldValues } from 'react-hook-form';

import type { LensCore } from './LensCore';

export type LensesStorageComplexKey = (...args: any[]) => any;

export interface LensesStorageValue {
  plain?: LensCore;
  complex: WeakMap<LensesStorageComplexKey, LensCore>;
}

export type LensCache = Map<string, LensesStorageValue>;

export class LensesStorage<TFieldValues extends FieldValues = FieldValues> {
  private cache: LensCache;

  constructor(control: Control<TFieldValues>) {
    this.cache = new Map();

    control?._subjects?.values?.subscribe?.({
      next: () => {
        control._names.unMount.forEach((name) => {
          this.delete(name);
        });
      },
    });
  }

  public get(propPath: string, complexKey?: LensesStorageComplexKey): LensCore | undefined {
    const cached = this.cache.get(propPath);

    if (cached) {
      if (complexKey) {
        return cached.complex.get(complexKey);
      }

      return cached.plain;
    }

    return undefined;
  }

  public set(lens: LensCore, propPath: string, complexKey?: LensesStorageComplexKey): void {
    let cached = this.cache.get(propPath);

    if (!cached) {
      cached = {
        complex: new WeakMap(),
      };

      this.cache.set(propPath, cached);
    }

    if (complexKey) {
      cached.complex.set(complexKey, lens);
    } else {
      cached.plain = lens;
    }
  }

  public has(propPath: string, complexKey?: LensesStorageComplexKey): boolean {
    if (complexKey) {
      return this.cache.get(propPath)?.complex.has(complexKey) ?? false;
    }

    return this.cache.has(propPath);
  }

  public delete(propPath: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(propPath)) {
        this.cache.delete(key);
      }
    }
  }

  public clear(): void {
    this.cache.clear();
  }
}
