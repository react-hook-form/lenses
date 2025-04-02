import { type Control, type FieldValues, get, set } from 'react-hook-form';

import type { LensesStorage } from './LensesStorage';
import type { Lens } from './types';

export interface LensCoreInteropBinding<T extends FieldValues> {
  control: Control<T>;
  name: string | undefined;
  getTransformer?: (value: unknown) => unknown;
  setTransformer?: (value: unknown) => unknown;
}

export class LensCore<T extends FieldValues> {
  public control: Control<T>;
  public path: string;
  public cache?: LensesStorage | undefined;

  private isArrayItemReflection?: boolean;
  private override?: Record<string, LensCore<T>> | [Record<string, LensCore<T>>];
  private interopCache?: LensCoreInteropBinding<T>;

  constructor(control: Control<T>, path: string, cache?: LensesStorage | undefined) {
    this.control = control;
    this.path = path;
    this.cache = cache;
  }

  public static create<TFieldValues extends FieldValues = FieldValues>(
    control: Control<TFieldValues>,
    cache?: LensesStorage,
  ): Lens<TFieldValues> {
    return new LensCore(control, '', cache) as unknown as Lens<TFieldValues>;
  }

  public focus(prop: string | number): LensCore<T> {
    const propString = prop.toString();
    const nestedPath = this.path ? `${this.path}.${propString}` : propString;

    if (Array.isArray(this.override)) {
      const [template] = this.override;
      const result = new LensCore(this.control, nestedPath, this.cache);
      result.isArrayItemReflection = true;
      result.override = template;

      return result;
    } else if (this.override) {
      const overriddenLens: LensCore<T> = get(this.override, propString);

      if (this.isArrayItemReflection) {
        const arrayItemNestedPath = `${this.path}.${overriddenLens.path}`;
        const result = new LensCore(this.control, arrayItemNestedPath, this.cache);
        return result;
      } else {
        return overriddenLens;
      }
    }

    return new LensCore(this.control, nestedPath, this.cache);
  }

  public reflect(
    getter: (
      dictionary: ProxyHandler<Record<string, LensCore<T>>>,
      lens: LensCore<T>,
    ) => Record<string, LensCore<T>> | [Record<string, LensCore<T>>],
  ): LensCore<T> {
    const template = new LensCore(this.control, '', this.cache);

    const dictionary = new Proxy(
      {},
      {
        get: (target, prop) => {
          if (typeof prop === 'string') {
            return template.focus(prop);
          }

          return target;
        },
      },
    );

    const override = getter(dictionary, template);

    if (Array.isArray(override)) {
      const result = new LensCore(this.control, this.path, this.cache);
      result.override = override;
      return result;
    } else {
      template.override = override;
      template.path = this.path;
      return template;
    }
  }

  public map<R>(
    fields: Record<string, any>[],
    mapper: (value: unknown, item: LensCore<T>, index: number, array: unknown[], lens: this) => R,
  ): R[] {
    return fields.map((value, index, array) => {
      const item = this.focus(index.toString());
      const res = mapper(value, item, index, array, this);
      return res;
    });
  }

  public interop(cb?: (control: Control<T>, name: string | undefined) => any): LensCoreInteropBinding<T> | undefined {
    if (cb) {
      return cb(this.control, this.path);
    }

    this.interopCache ??= {
      control: this.control,
      name: this.path,
      getTransformer: this.getTransformer.bind(this),
      setTransformer: this.setTransformer.bind(this),
    };

    return this.interopCache;
  }

  private getTransformer(value: unknown): unknown {
    const [template] = Array.isArray(this.override) ? this.override : [this.override];

    if (!value || !template) {
      return value;
    }

    const newValue = {} as typeof value;

    Object.entries(template).forEach(([key, valueTemplate]) => {
      const restructuredLens = valueTemplate;

      if (!restructuredLens) {
        return;
      }

      const v = get(value, restructuredLens.path);
      set(newValue, key, v);
    });

    return newValue;
  }

  private setTransformer(value: unknown): unknown {
    const [template] = Array.isArray(this.override) ? this.override : [this.override];

    if (!value || !template) {
      return value;
    }

    const newValue = {} as typeof value;

    Object.entries(value).forEach(([key, value]) => {
      const restructuredLens = template[key];

      if (!restructuredLens) {
        return;
      }

      set(newValue, restructuredLens.path, value);
    });

    return newValue;
  }
}
