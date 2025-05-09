import { type SubmitHandler, useForm } from 'react-hook-form';
import { useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { StringInput } from '../../components';

const meta = {
  title: 'Focus/Array',
  component: Playground,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

interface Item {
  id: string;
  value: string;
}

interface PlaygroundData {
  items: Item[];
}

interface PlaygroundProps {
  onSubmit: SubmitHandler<PlaygroundData>;
}

function Playground({ onSubmit = action('submit') }: PlaygroundProps) {
  const { handleSubmit, control } = useForm<PlaygroundData>({});
  const lens = useLens({ control });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <StringInput label="Id 0" lens={lens.focus('items.0.id')} />
        <StringInput label="Value 0" lens={lens.focus('items.0.value')} />
      </div>

      <div>
        <StringInput label="Id 1" lens={lens.focus('items.1.id')} />
        <StringInput label="Value 1" lens={lens.focus('items.1.value')} />
      </div>
      <div>
        <input type="submit" />
      </div>
    </form>
  );
}

export const ByString: Story = {
  args: {
    onSubmit: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByPlaceholderText(/items.0.id/i), 'one');
    await userEvent.type(canvas.getByPlaceholderText(/items.0.value/i), 'one value');
    await userEvent.type(canvas.getByPlaceholderText(/items.1.id/i), 'two');
    await userEvent.type(canvas.getByPlaceholderText(/items.1.value/i), 'two value');

    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));

    expect(args.onSubmit).toHaveBeenCalledWith(
      {
        items: [
          {
            id: 'one',
            value: 'one value',
          },
          {
            id: 'two',
            value: 'two value',
          },
        ],
      },
      expect.anything(),
    );
  },
};
