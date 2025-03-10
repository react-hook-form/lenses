import {
  type FieldArray,
  type FieldArrayPath,
  type FieldValues,
  set,
  useFieldArray as useFieldArrayOriginal,
  type UseFieldArrayProps as UseFieldArrayPropsOriginal,
  type UseFieldArrayReturn,
} from 'react-hook-form';

import type { LensCore } from '../LensCore';

interface UseFieldArrayProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id',
> extends UseFieldArrayPropsOriginal<TFieldValues, TFieldArrayName, TKeyName> {
  lens?: LensCore;
}

export function useFieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id',
>(props: UseFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName>): UseFieldArrayReturn<TFieldValues, TFieldArrayName, TKeyName> {
  const result = useFieldArrayOriginal(props);

  const transformOnSet = (value: FieldArray<TFieldValues, TFieldArrayName>) => {
    if (!props.lens || !props.lens.settings.lensesMap || !value) {
      return value;
    }

    const newValue = {} as typeof value;

    Object.entries(value || {}).forEach(([key, value]) => {
      // @ts-expect-error temporal workaround for array lense reflection
      const restructuredLens = props.lens.settings.lensesMap?.[0]?.[key];
      const newKey = restructuredLens?.settings.propPath?.slice(`${props.lens?.settings.restructureSourcePath}.`.length);
      set(newValue, newKey, value);
    });

    return newValue;
  };

  return {
    ...result,
    prepend: (value, options) => {
      const newValue = Array.isArray(value) ? value.map(transformOnSet) : transformOnSet(value);
      result.prepend(newValue, options);
    },
    append: (value, options) => {
      const newValue = Array.isArray(value) ? value.map(transformOnSet) : transformOnSet(value);
      result.append(newValue, options);
    },
    insert: (index, value, options) => {
      const newValue = Array.isArray(value) ? value.map(transformOnSet) : transformOnSet(value);
      result.insert(index, newValue, options);
    },
    update: (index, value) => {
      const newValue = transformOnSet(value);
      result.update(index, newValue);
    },
    replace: (value) => {
      const newValue = Array.isArray(value) ? value.map(transformOnSet) : transformOnSet(value);
      result.replace(newValue);
    },
  };
}
