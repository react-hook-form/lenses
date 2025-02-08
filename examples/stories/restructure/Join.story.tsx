import { SubmitHandler, useForm } from 'react-hook-form';
import { Lens, useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import type { Meta } from '@storybook/react';

import { StringInput } from '../components';

export default {
  title: 'Restructure',
} satisfies Meta;

export interface JoinFormData {
  firstName: string;
  lastName: string;
}

export interface JoinProps {
  onSubmit: SubmitHandler<JoinFormData>;
}

export function Join({ onSubmit = action('submit') }: JoinProps) {
  const { handleSubmit, control } = useForm<JoinFormData>();
  const lens = useLens({ control });

  const firstName = lens.focus('firstName');
  const lastName = lens.focus('lastName');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PersonForm lens={firstName.join(lastName, (firstNameLens, lastNameLens) => ({ name: firstNameLens, surname: lastNameLens }))} />

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
