import { useFieldArray, useForm } from 'react-hook-form';
import { Lens, useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';

export default {
  title: 'Quickstart',
} satisfies Meta;

export function Quickstart() {
  const { handleSubmit, control } = useForm<{
    firstName: string;
    lastName: string;
    children: {
      name: string;
      surname: string;
    }[];
  }>({});

  const lens = useLens({ control });

  return (
    <form onSubmit={handleSubmit(action('submit'))}>
      <PersonForm
        lens={lens.reflect((l) => ({
          name: l.focus('firstName'),
          surname: l.focus('lastName'),
        }))}
      />
      <ChildForm lens={lens.focus('children')} />
      <input type="submit" />
    </form>
  );
}

function ChildForm({ lens }: { lens: Lens<{ name: string; surname: string }[]> }) {
  const { fields, append } = useFieldArray(lens.interop());

  return (
    <>
      <button type="button" onClick={() => append({ name: '', surname: '' })}>
        Add child
      </button>
      {lens.map(fields, (value, l) => (
        <PersonForm key={value.id} lens={l} />
      ))}
    </>
  );
}

function PersonForm({ lens }: { lens: Lens<{ name: string; surname: string }> }) {
  return (
    <div>
      <StringInput lens={lens.focus('name')} />
      <StringInput lens={lens.focus('surname')} />
    </div>
  );
}

function StringInput({ lens }: { lens: Lens<string> }) {
  return <input {...lens.interop((ctrl, name) => ctrl.register(name))} />;
}
