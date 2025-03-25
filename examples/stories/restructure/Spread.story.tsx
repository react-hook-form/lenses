import { useForm } from 'react-hook-form';
import { Lens, useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';

export default {
  title: 'Restructure',
} satisfies Meta;

export function Spread() {
  const { handleSubmit, control } = useForm<{
    firstName: string;
    lastName: string;
    age: number;
  }>({});

  const lens = useLens({ control });

  return (
    <form onSubmit={handleSubmit(action('submit'))}>
      <PersonForm
        lens={lens.reflect(({ firstName, lastName, ...rest }) => ({
          ...rest,
          name: firstName,
          surname: lastName,
        }))}
      />
      <input type="submit" />
    </form>
  );
}

function PersonForm({ lens }: { lens: Lens<{ name: string; surname: string; age: number }> }) {
  return (
    <div>
      <StringInput lens={lens.focus('name')} />
      <StringInput lens={lens.focus('surname')} />
      <NumberInput lens={lens.focus('age')} />
    </div>
  );
}

function StringInput({ lens }: { lens: Lens<string> }) {
  return <input {...lens.interop((ctrl, name) => ctrl.register(name))} />;
}

function NumberInput({ lens }: { lens: Lens<number> }) {
  return <input type="number" {...lens.interop((ctrl, name) => ctrl.register(name, { valueAsNumber: true }))} />;
}
