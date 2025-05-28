import { type SubmitHandler, useForm } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { NumberInput, StringInput } from '../../components';

const meta = {
  title: 'Reflect/Object',
  component: Playground,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

interface PlaygroundData {
  firstName: string;
  lastName: string;
  age: number;
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
        lens={lens.reflect(({ firstName, lastName, ...rest }) => ({
          ...rest,
          name: firstName,
          surname: lastName,
        }))}
      />
      <div>
        <input type="submit" />
      </div>
    </form>
  );
}

function PersonForm({ lens }: { lens: Lens<{ name: string; surname: string; age: number }> }) {
  return (
    <div>
      <StringInput label="Name" lens={lens.focus('name')} />
      <StringInput label="Surname" lens={lens.focus('surname')} />
      <NumberInput label="Age" lens={lens.focus('age')} />
    </div>
  );
}

export const Spread: Story = {
  args: {
    onSubmit: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByPlaceholderText(/firstName/i), 'joe');
    await userEvent.type(canvas.getByPlaceholderText(/lastName/i), 'doe');
    await userEvent.type(canvas.getByPlaceholderText(/age/i), '20');
    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));

    expect(args.onSubmit).toHaveBeenCalledWith(
      {
        firstName: 'joe',
        lastName: 'doe',
        age: 20,
      },
      expect.anything(),
    );
  },
};
