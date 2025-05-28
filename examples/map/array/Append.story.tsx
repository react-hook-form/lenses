import { type SubmitHandler, useForm } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { useFieldArray } from '@hookform/lenses/rhf';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { StringInput } from '../../components';

const meta = {
  title: 'Map/Array',
  component: Playground,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

interface Item {
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
      <Items lens={lens.focus('items')} />
      <div>
        <input type="submit" />
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

export const Append: Story = {
  args: {
    onSubmit: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /add item/i }));
    await userEvent.type(canvas.getByPlaceholderText(/items\.0\.value/i), 'one');

    await userEvent.click(canvas.getByRole('button', { name: /add item/i }));
    await userEvent.type(canvas.getByPlaceholderText(/items\.1\.value/i), 'two');

    await userEvent.click(canvas.getByRole('button', { name: /add item/i }));
    await userEvent.type(canvas.getByPlaceholderText(/items\.2\.value/i), 'three');

    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));

    expect(args.onSubmit).toHaveBeenCalledWith(
      {
        items: [{ value: 'one' }, { value: 'two' }, { value: 'three' }],
      },
      expect.anything(),
    );
  },
};
