import { type Control, type FieldValues, get } from 'react-hook-form';

import type { Lens } from './types/lenses';
import type { LensesStorage } from './LensesStorage';

interface Settings {
  lensesMap?: Record<string, LensCore> | [Record<string, LensCore>] | undefined;
  propPath?: string | undefined;
  restructureSourcePath?: string | undefined;
}

export class LensCore {
  public settings: Settings;
  public control: Control;
  public cache?: LensesStorage | undefined;

  private constructor(control: Control<any>, cache?: LensesStorage, settings: Settings = {}) {
    this.control = control;
    this.cache = cache;
    this.settings = settings;
  }

  public static create<TFieldValues extends FieldValues = FieldValues>(
    control: Control<TFieldValues>,
    cache?: LensesStorage,
  ): Lens<TFieldValues> {
    return new LensCore(control, cache) as unknown as Lens<TFieldValues>;
  }

  public focus(propPath: string): LensCore {
    let nestedPath = this.settings.propPath === undefined ? propPath : `${this.settings.propPath}.${propPath}`;

    if (this.settings.lensesMap) {
      if (Array.isArray(this.settings.lensesMap)) {
        const arrayReflectMapper: LensCore | undefined = get(this.settings.lensesMap[0], propPath);

        if (arrayReflectMapper) {
          const reflectedPropPath = arrayReflectMapper.settings.propPath?.slice(`${this.settings.restructureSourcePath}.`.length);

          if (reflectedPropPath) {
            nestedPath = `${this.settings.propPath}.${reflectedPropPath}`;

            if (!this.cache?.has(nestedPath)) {
              const newLens = new LensCore(arrayReflectMapper.control, arrayReflectMapper.cache, {
                ...arrayReflectMapper.settings,
                propPath: nestedPath,
              });
              this.cache?.set(newLens, nestedPath);
            }

            const focusedLens = this.cache?.get(nestedPath);

            if (!focusedLens) {
              throw new Error(`There is no focused lens: ${nestedPath}`);
            }

            return focusedLens;
          }
        }
      } else {
        const result = get(this.settings.lensesMap, propPath);
        if (result) {
          return result;
        }
      }
    }

    if (!this.cache?.has(nestedPath)) {
      const newLens = new LensCore(this.control, this.cache, {
        propPath: nestedPath,
        lensesMap: this.settings.lensesMap,
        restructureSourcePath: this.settings.restructureSourcePath,
      });
      this.cache?.set(newLens, nestedPath);
    }

    const focusedLens = this.cache?.get(nestedPath);

    if (!focusedLens) {
      throw new Error(`There is no focused lens: ${nestedPath}`);
    }

    return focusedLens;
  }

  public reflect(getter: (original: LensCore) => Record<string, LensCore> | [Record<string, LensCore>]): LensCore {
    const fromCache = this.cache?.get(this.settings.propPath ?? '', getter);

    if (fromCache) {
      return fromCache;
    }

    const focusContext = getter(this);

    const newLens = new LensCore(this.control, this.cache, {
      lensesMap: focusContext,
      propPath: this.settings.propPath,
      restructureSourcePath: this.settings.propPath,
    });

    this.cache?.set(newLens, this.settings.propPath ?? '', getter);

    return newLens;
  }

  public join(another: LensCore, merger: (original: LensCore, another: LensCore) => Record<string, LensCore>): LensCore {
    const fromCache = this.cache?.get(this.settings.propPath ?? '', merger);

    if (fromCache) {
      return fromCache;
    }

    const focusContext = merger(this, another);
    const newLens = new LensCore(this.control, this.cache, {
      lensesMap: focusContext,
      propPath: this.settings.propPath,
      restructureSourcePath: this.settings.propPath,
    });

    this.cache?.set(newLens, this.settings.propPath ?? '', merger);

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

  public interop(cb?: (control: Control, name: string | undefined, lens: LensCore) => any): {
    control: Control;
    name: string | undefined;
    lens: LensCore;
  } {
    return cb ? cb(this.control, this.settings.propPath, this) : { control: this.control, name: this.settings.propPath, lens: this };
  }
}
