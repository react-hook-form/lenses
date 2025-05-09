import { type SubmitHandler, useForm } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { useFieldArray } from '@hookform/lenses/rhf';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { StringInput } from '../../components';

const meta = {
  title: 'Reflect/Array',
  component: Playground,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

interface Item {
  value: { inside: string };
}

interface PlaygroundData {
  items: Item[];
}

interface PlaygroundProps {
  onSubmit: SubmitHandler<PlaygroundData>;
}

function Playground({ onSubmit = action('submit') }: PlaygroundProps) {
  const { handleSubmit, control } = useForm<PlaygroundData>({
    defaultValues: { items: [{ value: { inside: 'one' } }, { value: { inside: 'two' } }, { value: { inside: 'three' } }] },
  });
  const lens = useLens({ control });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Items lens={lens.focus('items').reflect((l) => [{ data: l.value.focus('inside') }])} />
      <div>
        <input type="submit" />
      </div>
    </form>
  );
}

function Items({ lens }: { lens: Lens<{ data: string }[]> }) {
  const { fields, append } = useFieldArray(lens.interop());

  return (
    <div>
      {lens.map(fields, (value, l) => (
        <div key={value.id}>
          <div>Data: {value.data}</div>
          <StringInput label="Value" lens={l.focus('data')} />
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          append({ data: 'more' });
        }}
      >
        Add item
      </button>
    </div>
  );
}

export const TopLevel: Story = {
  args: {
    onSubmit: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByPlaceholderText('items.0.value.inside')).toHaveValue('one');
    expect(canvas.getByPlaceholderText('items.1.value.inside')).toHaveValue('two');
    expect(canvas.getByPlaceholderText('items.2.value.inside')).toHaveValue('three');

    await userEvent.click(canvas.getByText(/Add item/i));

    await userEvent.type(canvas.getByPlaceholderText('items.3.value.inside'), ' four');
    expect(canvas.getByPlaceholderText('items.3.value.inside')).toHaveValue('more four');

    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));

    expect(args.onSubmit).toHaveBeenCalledWith(
      {
        items: [
          { value: { inside: 'one' } },
          { value: { inside: 'two' } },
          { value: { inside: 'three' } },
          { value: { inside: 'more four' } },
        ],
      },
      expect.anything(),
    );
  },
};
