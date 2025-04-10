import { type SubmitHandler, useForm } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { useFieldArray } from '@hookform/lenses/rhf';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { StringInput } from '../components';

const meta = {
  title: 'Restructure',
  component: ArrayReflect,
} satisfies Meta;

type Story = StoryObj<typeof meta>;
export default meta;

export interface Item {
  value: { inside: string };
}

export interface ArrayReflectFormData {
  items: Item[];
}

export interface ArrayReflectProps {
  onSubmit: SubmitHandler<ArrayReflectFormData>;
}

export function ArrayReflect({ onSubmit = action('submit') }: ArrayReflectProps) {
  const { handleSubmit, control } = useForm<ArrayReflectFormData>({
    defaultValues: { items: [{ value: { inside: 'one' } }, { value: { inside: 'two' } }, { value: { inside: 'three' } }] },
  });
  const lens = useLens({ control });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Items lens={lens.focus('items').reflect((l) => [{ data: l.value.focus('inside') }])} />
      <div>
        <button type="submit">submit</button>
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

const onSubmit = fn();

export const ShouldChangeArrayLensViaReflect: Story = {
  args: {
    onSubmit,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByPlaceholderText('items.0.value.inside')).toHaveValue('one');
    expect(canvas.getByPlaceholderText('items.1.value.inside')).toHaveValue('two');
    expect(canvas.getByPlaceholderText('items.2.value.inside')).toHaveValue('three');

    await userEvent.click(canvas.getByText(/Add item/i));

    await userEvent.type(canvas.getByPlaceholderText('items.3.value.inside'), ' four');
    expect(canvas.getByPlaceholderText('items.3.value.inside')).toHaveValue('more four');

    await userEvent.click(canvas.getByText(/submit/i));

    expect(onSubmit).toHaveBeenCalledWith(
      {
        items: [
          { value: { inside: 'one' } },
          { value: { inside: 'two' } },
          { value: { inside: 'three' } },
          { value: { inside: 'more four' } },
        ],
      } satisfies ArrayReflectFormData,
      expect.anything(),
    );
  },
};
