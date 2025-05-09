import { type SubmitHandler, useForm } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { StringInput } from '../../components';

const meta = {
  title: 'Reflect/Object',
  component: Playground,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

interface PlaygroundData {
  firstName: string;
  lastName: string;
}

interface PlaygroundProps {
  onSubmit: SubmitHandler<PlaygroundData>;
}

function Playground({ onSubmit = action('submit') }: PlaygroundProps) {
  const { handleSubmit, control } = useForm<PlaygroundData>();
  const lens = useLens({ control });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PersonForm
        lens={lens.focus('firstName').reflect((_, firstName) => ({
          name: firstName.reflect((_, l) => ({ nestedName: l })).focus('nestedName'),
          surname: lens.focus('lastName'),
        }))}
      />
      <div>
        <input type="submit" />
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

export const Nested: Story = {
  args: {
    onSubmit: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByPlaceholderText(/firstName/i), 'joe');
    await userEvent.type(canvas.getByPlaceholderText(/lastName/i), 'doe');

    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));

    expect(args.onSubmit).toHaveBeenCalledWith(
      {
        firstName: 'joe',
        lastName: 'doe',
      },
      expect.anything(),
    );
  },
};
