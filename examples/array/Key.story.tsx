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
  anotherId: string;
  value: string;
}

export interface KeyData {
  items: Item[];
}

export interface KeyProps {
  onSubmit: SubmitHandler<KeyData>;
}

export function Key({ onSubmit = action('submit') }: KeyProps) {
  const { handleSubmit, control } = useForm<KeyData>({ defaultValues: { items: [{ value: 'one' }, { value: 'two' }] } });
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
  const { fields } = useFieldArray({ ...lens.interop(), keyName: 'anotherId' });

  return (
    <div>
      {lens.map(fields, (value, l) => (
        <div key={value.anotherId}>
          <StringInput label="Value" lens={l.focus('value')} />
        </div>
      ))}
    </div>
  );
}
