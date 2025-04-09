import { type SubmitHandler, useForm } from 'react-hook-form';
import { useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import type { Meta } from '@storybook/react';

import { StringInput } from '../components';

export default {
  title: 'Array',
} satisfies Meta;

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
