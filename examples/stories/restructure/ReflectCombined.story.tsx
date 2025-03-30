import { SubmitHandler, useForm } from 'react-hook-form';
import { Lens, useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import type { Meta } from '@storybook/react';

import { StringInput } from '../components';

export default {
  title: 'Restructure',
} satisfies Meta;

export interface ReflectCombinedFormData {
  firstName: string;
  lastName: string;
}

export interface ReflectCombinedProps {
  onSubmit: SubmitHandler<ReflectCombinedFormData>;
}

export function ReflectCombined({ onSubmit = action('submit') }: ReflectCombinedProps) {
  const { handleSubmit, control } = useForm<ReflectCombinedFormData>();
  const lens = useLens({ control });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PersonForm
        lens={lens.focus('firstName').reflect((_, firstName) => ({
          name: firstName.reflect((_, l) => ({ nestedName: l })).focus('nestedName'),
          surname: lens.focus('lastName'),
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
