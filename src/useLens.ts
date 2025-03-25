import { type DependencyList, useMemo } from 'react';
import type { Control, FieldValues } from 'react-hook-form';

import { LensCore } from './LensCore';
import { LensesStorage } from './LensesStorage';
import type { Lens } from './types';

export interface UseLensProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
}

export function useLens<TFieldValues extends FieldValues = FieldValues>(
  props: UseLensProps<TFieldValues>,
  deps: DependencyList = [],
): Lens<TFieldValues> {
  return useMemo(() => {
    const cache = new LensesStorage(props.control);
    const lens = LensCore.create<TFieldValues>(props.control, cache);

    return lens;
  }, [props.control, ...deps]);
}
