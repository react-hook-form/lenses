import { SubmitHandler, useForm } from 'react-hook-form';
import { Lens, useLens } from '@hookform/lenses';
import { useFieldArray } from '@hookform/lenses/rhf';
import { action } from '@storybook/addon-actions';
import type { Meta } from '@storybook/react';

import { StringInput } from '../components';

export default {
  title: 'Restructure',
} satisfies Meta;

export interface ReflectFormData {
  firstName: string;
  lastName: { value: string };
}

export interface ReflectProps {
  onSubmit: SubmitHandler<ReflectFormData>;
}

export function Reflect({ onSubmit = action('submit') }: ReflectProps) {
  const { handleSubmit, control } = useForm<ReflectFormData>();
  const lens = useLens({ control });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PersonForm
        lens={lens.reflect((l) => ({
          name: l.focus('firstName'),
          surname: l.focus('lastName.value'),
        }))}
      />

      <div>
        <button id="submit">Submit</button>
      </div>
    </form>
  );
}

interface PersonFormData {
  name: string;
  surname: string;
}

function PersonForm({ lens }: { lens: Lens<PersonFormData> }) {
  return (
    <div>
      <StringInput label="Name" lens={lens.focus('name')} />
      <StringInput label="Surname" lens={lens.focus('surname')} />
    </div>
  );
}

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
      <Items lens={lens.focus('items').reflect((l) => [{ data: l.focus('value').focus('inside') }])} />
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
      {lens.map(fields, (l, key) => (
        <div key={key}>
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
