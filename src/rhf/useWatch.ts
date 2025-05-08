import { type Control, type FieldValues, useWatch as useWatchRhf } from 'react-hook-form';

/**
 * Watch lens.
 *
 * @example
 * ```tsx
 * import { useWatch } from './useWatch';
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
 *   const { name, control } = lens.interop();
 *   const formValues = useWatch({ name, control });
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
export function useWatch<TFieldValues extends FieldValues = FieldValues>(props: {
  name: '__DO_NOT_USE_HOOK_FORM_CONTROL_SHIM__';
  control: Control<TFieldValues>;
}): TFieldValues['__DO_NOT_USE_HOOK_FORM_CONTROL_SHIM__'] {
  const { control, name } = props;
  return useWatchRhf({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    name: name ? name : undefined,
    control,
  }) as TFieldValues['__DO_NOT_USE_HOOK_FORM_CONTROL_SHIM__'];
}
