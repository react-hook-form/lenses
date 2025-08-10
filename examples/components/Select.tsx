import { type RegisterOptions } from 'react-hook-form';
import { type HookFormControlShim, type Lens } from '@hookform/lenses';

export interface SelectOption<T extends string | number> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string | number>
  extends Omit<RegisterOptions<HookFormControlShim<T>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'onBlur' | 'onChange' | 'value'> {
  label: string;
  lens: Lens<T>;
  options: SelectOption<T>[];
}

export function Select<T extends string | number>({ label, lens, options, ...rules }: SelectProps<T>) {
  const { control, name } = lens.interop();

  return (
    <label>
      {label}&nbsp;
      {/* @ts-expect-error - TODO: fix this */}
      <select {...control.register(name, rules)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
