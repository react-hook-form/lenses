import { type SubmitHandler, useForm } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

const meta = {
  title: 'Hook Form',
  component: Register,
} satisfies Meta;

type Story = StoryObj<typeof meta>;
export default meta;

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

const onSubmit = fn();

export const RegisterViaLens: Story = {
  args: {
    onSubmit,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByPlaceholderText(/username/i), 'joe');
    await userEvent.type(canvas.getByPlaceholderText(/age/i), '20');

    await userEvent.click(canvas.getByText(/submit/i));

    expect(onSubmit).toHaveBeenCalledWith(
      {
        username: 'joe',
        age: 20,
      },
      expect.anything(),
    );
  },
};
