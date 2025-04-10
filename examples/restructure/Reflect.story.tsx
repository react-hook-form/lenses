import { type SubmitHandler, useForm } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { StringInput } from '../components';

const meta = {
  title: 'Restructure',
  component: Reflect,
} satisfies Meta;

type Story = StoryObj<typeof meta>;
export default meta;

export interface ReflectFormData {
  firstName: string;
  lastName: { value: string };
}

export interface ReflectProps {
  onSubmit: SubmitHandler<ReflectFormData>;
}

export function Reflect({ onSubmit = action('submit') }: ReflectProps) {
  const { handleSubmit, control } = useForm<ReflectFormData>();
  const lens = useLens({ control });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PersonForm
        lens={lens.reflect(({ firstName, lastName }) => ({
          name: firstName,
          surname: lastName.focus('value'),
        }))}
      />

      <div>
        <button id="submit">Submit</button>
      </div>
    </form>
  );
}

interface PersonFormData {
  name: string;
  surname: string;
}

function PersonForm({ lens }: { lens: Lens<PersonFormData> }) {
  return (
    <div>
      <StringInput label="Name" lens={lens.focus('name')} />
      <StringInput label="Surname" lens={lens.focus('surname')} />
    </div>
  );
}

const onSubmit = fn();

export const ShouldChangeLensViaReflect: Story = {
  args: {
    onSubmit,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByPlaceholderText(/firstName/i), 'joe');
    await userEvent.type(canvas.getByPlaceholderText(/lastName/i), 'doe');

    await userEvent.click(canvas.getByText(/submit/i));

    expect(onSubmit).toHaveBeenCalledWith(
      {
        firstName: 'joe',
        lastName: { value: 'doe' },
      } satisfies ReflectFormData,
      expect.anything(),
    );
  },
};
