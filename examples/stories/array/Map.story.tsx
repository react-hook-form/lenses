import { type SubmitHandler, useForm } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { useFieldArray } from '@hookform/lenses/rhf';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { StringInput } from '../components';

const meta = {
  title: 'Array',
  component: Map,
} satisfies Meta;

type Story = StoryObj<typeof meta>;
export default meta;

export interface Item {
  value: string;
}

export interface MapData {
  items: Item[];
}

export interface MapProps {
  onSubmit: SubmitHandler<MapData>;
}

export function Map({ onSubmit = action('submit') }: MapProps) {
  const { handleSubmit, control } = useForm<MapData>({});
  const lens = useLens({ control });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Items lens={lens.focus('items')} />
      <div>
        <button type="submit">submit</button>
      </div>
    </form>
  );
}

function Items({ lens }: { lens: Lens<Item[]> }) {
  const { fields, append } = useFieldArray(lens.interop());

  return (
    <div>
      {lens.map(fields, (value, l) => (
        <div key={value.id}>
          <StringInput label="Value" lens={l.focus('value')} />
        </div>
      ))}
      <button type="button" onClick={() => append({ value: '' })}>
        Add item
      </button>
    </div>
  );
}

const onSubmit = fn();

export const AddNestedArrayElements: Story = {
  args: {
    onSubmit,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /add item/i }));
    await userEvent.type(canvas.getByPlaceholderText(/items\.0\.value/i), 'one');

    await userEvent.click(canvas.getByRole('button', { name: /add item/i }));
    await userEvent.type(canvas.getByPlaceholderText(/items\.1\.value/i), 'two');

    await userEvent.click(canvas.getByRole('button', { name: /add item/i }));
    await userEvent.type(canvas.getByPlaceholderText(/items\.2\.value/i), 'three');

    await userEvent.click(canvas.getByText(/submit/i));

    expect(onSubmit).toHaveBeenCalledWith(
      {
        items: [{ value: 'one' }, { value: 'two' }, { value: 'three' }],
      },
      expect.anything(),
    );
  },
};
