import { type SubmitHandler, useForm } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { useFieldArray } from '@hookform/lenses/rhf';
import { action } from '@storybook/addon-actions';
import { type Meta } from '@storybook/react';

export default {
  title: 'Demo',
} satisfies Meta;

export interface Person {
  name: string;
  surname: string;
}

export interface DemoFormData {
  firstName: string;
  lastName: string;
  age: number;
  children: Person[];
}

export interface DemoProps {
  onSubmit: SubmitHandler<DemoFormData>;
}

export function Demo({ onSubmit = action('submit') }: DemoProps) {
  const { handleSubmit, control } = useForm<DemoFormData>({});
  const lens = useLens({ control });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PersonForm
        lens={lens.reflect(({ firstName, lastName }) => ({
          name: firstName,
          surname: lastName,
        }))}
      />
      <NumberInput lens={lens.focus('age')} />

      <ChildForm lens={lens.focus('children')} />
      <div>
        <input type="submit" />
      </div>
    </form>
  );
}

function ChildForm({ lens }: { lens: Lens<Person[]> }) {
  const { fields, append } = useFieldArray(lens.interop());

  return (
    <div>
      {lens.map(fields, (value, l) => (
        <PersonForm key={value.id} lens={l} />
      ))}
      <button type="button" onClick={() => append({ name: '', surname: '' })}>
        Add child
      </button>
    </div>
  );
}

function PersonForm({ lens }: { lens: Lens<Person> }) {
  return (
    <>
      <StringInput lens={lens.focus('name')} />
      <StringInput lens={lens.focus('surname')} />
    </>
  );
}

function StringInput({ lens }: { lens: Lens<string> }) {
  return <input {...lens.interop((ctrl, name) => ctrl.register(name))} />;
}

function NumberInput({ lens }: { lens: Lens<number> }) {
  return <input type="number" {...lens.interop((ctrl, name) => ctrl.register(name))} />;
}
