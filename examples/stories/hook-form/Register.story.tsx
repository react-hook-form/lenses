import { SubmitHandler, useForm } from 'react-hook-form';
import { Lens, useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import type { Meta } from '@storybook/react';

export default {
  title: 'Hook Form',
} satisfies Meta;

export interface RegisterFormData {
  username: string;
  age: number;
}

export interface RegisterProps {
  onSubmit: SubmitHandler<RegisterFormData>;
}

export function Register({ onSubmit = action('submit') }: RegisterProps) {
  const { handleSubmit, control } = useForm<RegisterFormData>({});
  const lens = useLens({ control });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StringInput lens={lens.focus('username')} placeholder="username" />
      <NumberInput lens={lens.focus('age')} placeholder="age" />

      <div>
        <button type="submit">submit</button>
      </div>
    </form>
  );
}

interface StringInputProps {
  lens: Lens<string>;
  placeholder?: string;
}

function StringInput({ lens, placeholder }: StringInputProps) {
  return <input {...lens.interop((ctrl, name) => ctrl.register(name))} placeholder={placeholder} />;
}

interface NumberInputProps {
  lens: Lens<number>;
  placeholder?: string;
}

function NumberInput({ lens, placeholder }: NumberInputProps) {
  const { control, name } = lens.interop();

  return <input type="number" {...control.register(name, { valueAsNumber: true })} placeholder={placeholder} />;
}
