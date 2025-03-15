import { type DependencyList, useMemo } from 'react';
import type { Control, FieldValues } from 'react-hook-form';

import type { Lens } from './types/lenses';
import { LensCore } from './LensCore';
import { LensesStorage } from './LensesStorage';

export interface UseLensProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
}

/**
 * Creates lens from react-hook-form control.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { control } = useForm<{
 *     firstName: string;
 *   }>();
 *
 *   const lens = useLens({ control });
 * }
 * ```
 */
export function useLens<TFieldValues extends FieldValues = FieldValues>(
  props: UseLensProps<TFieldValues>,
  deps: DependencyList = [],
): Lens<TFieldValues> {
  return useMemo(() => {
    const cache = new LensesStorage();
    const lens = LensCore.create<TFieldValues>(props.control, cache);

    return lens;
  }, [props.control, ...deps]);
}
