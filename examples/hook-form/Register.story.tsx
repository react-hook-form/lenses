import { type SubmitHandler, useForm } from 'react-hook-form';
import { useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { NumberInput, StringInput } from '../components';

const meta = {
  title: 'HookForm',
  component: Playground,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

interface PlaygroundData {
  username: string;
  age: number;
}

interface PlaygroundProps {
  onSubmit: SubmitHandler<PlaygroundData>;
}

function Playground({ onSubmit = action('submit') }: PlaygroundProps) {
  const { handleSubmit, control } = useForm<PlaygroundData>({});
  const lens = useLens({ control });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StringInput label="Username" lens={lens.focus('username')} />
      <NumberInput label="Age" lens={lens.focus('age')} />
      <div>
        <input type="submit" />
      </div>
    </form>
  );
}

export const Register: Story = {
  args: {
    onSubmit: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByPlaceholderText(/username/i), 'joe');
    await userEvent.type(canvas.getByPlaceholderText(/age/i), '20');

    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));

    expect(args.onSubmit).toHaveBeenCalledWith(
      {
        username: 'joe',
        age: 20,
      },
      expect.anything(),
    );
  },
};
