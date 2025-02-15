import { RegisterOptions } from 'react-hook-form';
import { Lens, NonObjectFieldShim } from '@hookform/lenses';

export interface NumberInputProps
  extends Omit<
    RegisterOptions<NonObjectFieldShim<number>>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'onBlur' | 'onChange' | 'value' | 'pattern'
  > {
  label: string;
  lens: Lens<number>;
}

export function NumberInput({ label, lens, ...rules }: NumberInputProps) {
  const { control, name } = lens.interop();

  return (
    <label>
      {label} <input type="number" placeholder={name} {...control.register(name, { valueAsNumber: true, ...rules })} />
    </label>
  );
}
