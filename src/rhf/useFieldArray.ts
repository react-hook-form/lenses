import { useMemo } from 'react';
import {
  type FieldArray,
  type FieldArrayPath,
  type FieldArrayWithId,
  type FieldValues,
  useFieldArray as useFieldArrayOriginal,
  type UseFieldArrayProps as UseFieldArrayPropsOriginal,
  type UseFieldArrayReturn,
} from 'react-hook-form';

export interface UseFieldArrayProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id',
> extends UseFieldArrayPropsOriginal<TFieldValues, TFieldArrayName, TKeyName> {
  getTransformer?: <R extends TFieldValues, N extends FieldArrayPath<R>>(
    value: FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>,
  ) => FieldArrayWithId<R, N, TKeyName>;

  setTransformer?: <R extends FieldValues, N extends FieldArrayPath<R>>(
    value: FieldArray<R, N>,
  ) => FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>;
}

export function useFieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id',
>(props: UseFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName>): UseFieldArrayReturn<TFieldValues, TFieldArrayName, TKeyName> {
  const original = useFieldArrayOriginal(props);
  const newFields = useMemo(() => {
    if (!props.getTransformer) {
      return original.fields;
    }

    return original.fields.map(props.getTransformer);
  }, [original.fields, props.getTransformer]);

  return {
    fields: newFields,
    move: original.move,
    remove: original.remove,
    swap: original.swap,
    prepend: (value, options) => {
      if (!props.setTransformer) {
        return original.prepend(value, options);
      }

      const newValue = Array.isArray(value) ? value.map(props.setTransformer) : props.setTransformer(value);
      original.prepend(newValue, options);
    },
    append: (value, options) => {
      if (!props.setTransformer) {
        return original.append(value, options);
      }

      const newValue = Array.isArray(value) ? value.map(props.setTransformer) : props.setTransformer(value);
      original.append(newValue, options);
    },
    insert: (index, value, options) => {
      if (!props.setTransformer) {
        return original.insert(index, value, options);
      }

      const newValue = Array.isArray(value) ? value.map(props.setTransformer) : props.setTransformer(value);
      original.insert(index, newValue, options);
    },
    update: (index, value) => {
      if (!props.setTransformer) {
        return original.update(index, value);
      }

      const newValue = props.setTransformer(value);
      original.update(index, newValue);
    },
    replace: (value) => {
      if (!props.setTransformer) {
        return original.replace(value);
      }

      const newValue = props.setTransformer(value);
      original.replace(newValue);
    },
  };
}
