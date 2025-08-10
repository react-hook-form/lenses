import { type RegisterOptions } from 'react-hook-form';
import { type HookFormControlShim, type Lens } from '@hookform/lenses';

export interface CheckboxProps
  extends Omit<
    RegisterOptions<HookFormControlShim<boolean>>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'onBlur' | 'onChange' | 'value'
  > {
  label: string;
  lens: Lens<boolean>;
}

export function Checkbox({ label, lens, ...rules }: CheckboxProps) {
  const { control, name } = lens.interop();

  return (
    <label>
      {label}
      <input type="checkbox" {...control.register(name, rules)} />
    </label>
  );
}
