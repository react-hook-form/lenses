import { type RegisterOptions, type SubmitErrorHandler, type SubmitHandler, useController, useForm } from 'react-hook-form';
import { type HookFormControlShim, type Lens, useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { StringInput } from '../components';

const meta = {
  title: 'HookForm',
  component: Playground,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

interface PlaygroundData {
  firstName: string;
  password: string;
}

interface PlaygroundProps {
  onSubmit: SubmitHandler<PlaygroundData>;
  onInvalid: SubmitErrorHandler<PlaygroundData>;
}

function Playground({ onSubmit = action('submit'), onInvalid = action('invalid') }: PlaygroundProps) {
  const { handleSubmit, control } = useForm<PlaygroundData>({ shouldUseNativeValidation: true });
  const lens = useLens({ control });

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <StringInput label="First Name" lens={lens.focus('firstName')} />
      <PasswordInput lens={lens.focus('password')} rules={{ required: 'password is required' }} />

      <div>
        <input type="submit" />
      </div>
    </form>
  );
}

interface PasswordInputProps {
  lens: Lens<string>;
  rules?: RegisterOptions<HookFormControlShim<string>>;
}

function PasswordInput({ lens, rules = {} }: PasswordInputProps) {
  const { field, fieldState } = useController({ ...lens.interop(), rules });

  return (
    <label>
      <input type="password" style={{ borderColor: fieldState.error ? 'red' : undefined }} placeholder={field.name} {...field} />
      {fieldState.error && <b>{fieldState.error.message}</b>}
    </label>
  );
}

export const UseController: Story = {
  args: {
    onSubmit: fn(),
    onInvalid: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByPlaceholderText(/firstName/i), 'joe');
    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));

    expect(args.onSubmit).not.toHaveBeenCalled();
    expect(args.onInvalid).toHaveBeenCalledWith(
      {
        password: {
          message: 'password is required',
          ref: expect.anything(),
          type: 'required',
        },
      },
      expect.anything(),
    );

    await userEvent.type(canvas.getByPlaceholderText(/password/i), 'password');
    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));

    expect(args.onSubmit).toHaveBeenCalledWith(
      {
        firstName: 'joe',
        password: 'password',
      },
      expect.anything(),
    );
  },
};
