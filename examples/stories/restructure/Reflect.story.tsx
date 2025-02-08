import { SubmitHandler, useForm } from 'react-hook-form';
import { Lens, useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import type { Meta } from '@storybook/react';

import { StringInput } from '../components';

export default {
  title: 'Restructure',
} satisfies Meta;

export interface ReflectFormData {
  firstName: string;
  lastName: string;
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
          surname: l.focus('lastName'),
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
