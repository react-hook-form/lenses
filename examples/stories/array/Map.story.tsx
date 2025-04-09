import { type SubmitHandler, useForm } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { useFieldArray } from '@hookform/lenses/rhf';
import { action } from '@storybook/addon-actions';
import type { Meta } from '@storybook/react';

import { StringInput } from '../components';

export default {
  title: 'Array',
} satisfies Meta;

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
