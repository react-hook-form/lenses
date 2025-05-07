import { type FieldValues, useWatch } from 'react-hook-form';

import type { Lens } from './types';

/**
 * Watch lens.
 *
 * @example
 * ```tsx
 * import { useWatchLens } from './useWatchLens';
 * import type { Lens } from './types';
 *
 * export type FormValues = {
 *   message: string;
 * };
 *
 * type Props = {
 *   lens: Lens<FormValues>;
 * };
 *
 * export function CountableTextArea({ lens }: Props) {
 *   const formValues = useWatchLens(lens);
 *   const { name, control } = lens.interop();
 *
 *   return (
 *     <div>
 *       <input {...control.register(name)} />
 *       <p>Word Count: {formValues.message.length}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWatchLens<TFieldValues extends FieldValues = FieldValues>(lens: Lens<TFieldValues>): TFieldValues {
  const { control, name } = lens.interop();
  const data = useWatch({
    control,
  }) as TFieldValues;

  return name ? data[name] : data;
}
