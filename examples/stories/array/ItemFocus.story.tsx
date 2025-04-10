import { type SubmitHandler, useForm } from 'react-hook-form';
import { useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { StringInput } from '../components';

const meta = {
  title: 'Array',
  component: ItemFocus,
} satisfies Meta;

type Story = StoryObj<typeof meta>;
export default meta;

export interface Item {
  id: string;
  value: string;
}

export interface ItemFocusData {
  items: Item[];
}

export interface ItemFocusProps {
  onSubmit: SubmitHandler<ItemFocusData>;
}

export function ItemFocus({ onSubmit = action('submit') }: ItemFocusProps) {
  const { handleSubmit, control } = useForm<ItemFocusData>({});
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
        <button type="submit">submit</button>
      </div>
    </form>
  );
}

const onSubmit = fn();

export const RegisterViaLens: Story = {
  args: {
    onSubmit,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByPlaceholderText(/items.0.id/i), 'one');
    await userEvent.type(canvas.getByPlaceholderText(/items.0.value/i), 'one value');
    await userEvent.type(canvas.getByPlaceholderText(/items.1.id/i), 'two');
    await userEvent.type(canvas.getByPlaceholderText(/items.1.value/i), 'two value');

    await userEvent.click(canvas.getByText(/submit/i));

    expect(onSubmit).toHaveBeenCalledWith(
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
