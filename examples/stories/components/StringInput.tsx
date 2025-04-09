import { type RegisterOptions } from 'react-hook-form';
import { type HookFormControlShim, type Lens } from '@hookform/lenses';

export interface StringInputProps
  extends Omit<
    RegisterOptions<HookFormControlShim<string>>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'onBlur' | 'onChange' | 'value'
  > {
  label: string;
  lens: Lens<string>;
}

export function StringInput({ label, lens, ...rules }: StringInputProps) {
  const { control, name } = lens.interop();

  return (
    <label>
      {label} <input placeholder={name} {...control.register(name, rules)} />
    </label>
  );
}
