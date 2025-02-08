import { type Control, type FieldValues, get } from 'react-hook-form';

import { type LensesDeepMap, type LensesMap } from './types/helpers';
import type { Lens } from './types/lenses';
import type { LensesCache } from './utils';

interface Settings {
  lensesMap?: LensesDeepMap | undefined;
  propPath?: string | undefined;
}

export class LensCore {
  private settings: Settings;

  public control: Control;
  public cache: LensesCache;
  public name?: string | undefined;

  private constructor(control: Control<any>, cache: LensesCache, settings: Settings = {}) {
    this.control = control;
    this.cache = cache;
    this.settings = settings;
    this.name = settings.propPath;
  }

  public static create<TFieldValues extends FieldValues = FieldValues>(
    control: Control<TFieldValues>,
    cache: LensesCache,
  ): Lens<TFieldValues> {
    return new LensCore(control, cache) as unknown as Lens<TFieldValues>;
  }

  public focus(propPath: string): LensCore {
    const nestedPath = this.settings.propPath === undefined ? propPath : `${this.settings.propPath}.${propPath}`;

    if (this.settings.lensesMap) {
      const result = get(this.settings.lensesMap, nestedPath);

      if (result) {
        return result;
      }
    }

    if (!this.cache.primitives.has(nestedPath)) {
      const newLens = new LensCore(this.control, this.cache, { propPath: nestedPath });
      this.cache.primitives.set(nestedPath, newLens);
    }

    const focusedLens = this.cache.primitives.get(nestedPath);

    if (!focusedLens) {
      throw new Error(`There is no focused lens: ${nestedPath}`);
    }

    return focusedLens;
  }

  public reflect(getter: (original: LensCore) => LensesMap): LensCore {
    const fromCache = this.cache.complex.get(getter);

    if (fromCache) {
      return fromCache.lens;
    }

    const focusContext = getter(this);
    const newLens = new LensCore(this.control, this.cache, { lensesMap: focusContext });

    this.cache.complex.set(getter, { lens: newLens });

    return newLens;
  }

  public join(another: LensCore, merger: (original: LensCore, another: LensCore) => LensesMap): LensCore {
    const fromCache = this.cache.complex.get(merger);

    if (fromCache) {
      return fromCache.lens;
    }

    const focusContext = merger(this, another);
    const newLens = new LensCore(this.control, this.cache, { lensesMap: focusContext });

    this.cache.complex.set(merger, { lens: newLens });

    return newLens;
  }

  public map<R>(
    fields: Record<string, any>[],
    mapper: (value: unknown, key: string, index: number, array: this) => R,
    keyName = 'id',
  ): R[] {
    if (!this.settings.propPath) {
      throw new Error(`There is no prop name in this lens: ${this.settings.propPath}`);
    }

    return fields.map((value, index) => {
      const field = this.focus(index.toString());
      const res = mapper(field, value[keyName], index, this);
      return res;
    });
  }

  public interop(cb?: (control: Control, name: string | undefined) => any): { control: Control; name: string | undefined } {
    return cb ? cb(this.control, this.name) : { control: this.control, name: this.name };
  }
}
