import { type RegisterOptions, type SubmitErrorHandler, type SubmitHandler, useController, useForm } from 'react-hook-form';
import { type HookFormControlShim, type Lens, useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import type { Meta } from '@storybook/react';

export default {
  title: 'Hook Form',
} satisfies Meta;

export interface UseControllerFormData {
  firstName: string;
  password: string;
}

export interface UseControllerProps {
  onSubmit: SubmitHandler<UseControllerFormData>;
  onInvalid: SubmitErrorHandler<UseControllerFormData>;
}

export function UseController({ onSubmit = action('submit'), onInvalid = action('invalid') }: UseControllerProps) {
  const { handleSubmit, control } = useForm<UseControllerFormData>({ shouldUseNativeValidation: true });
  const lens = useLens({ control });

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <StringInput lens={lens.focus('firstName')} placeholder="firstName" />
      <PasswordInput lens={lens.focus('password')} placeholder="password" rules={{ required: 'password is required' }} />

      <div>
        <input type="submit" />
      </div>
    </form>
  );
}

interface StringInputProps {
  lens: Lens<string>;
  placeholder?: string;
}

function StringInput({ lens, placeholder }: StringInputProps) {
  const { field } = useController(lens.interop());

  return <input {...field} placeholder={placeholder} />;
}

interface PasswordInputProps {
  lens: Lens<string>;
  placeholder?: string;
  rules?: RegisterOptions<HookFormControlShim<string>>;
}

function PasswordInput({ lens, rules = {}, placeholder }: PasswordInputProps) {
  const { field, fieldState } = useController({ ...lens.interop(), rules });
  return (
    <label>
      <input type="password" style={{ borderColor: fieldState.error ? 'red' : undefined }} placeholder={placeholder} {...field} />
      {fieldState.error && <b>{fieldState.error.message}</b>}
    </label>
  );
}
