import { useState } from 'react';
import { Path, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { Lens, useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import type { Meta } from '@storybook/react';

import { NumberInput, StringInput } from '../components';

export default {
  title: 'Hook Form',
} satisfies Meta;

export interface UnregisterFormData {
  username: string;
  age: number;
  deep: {
    nested: {
      value: string;
    };
    another: string;
  };
  children: {
    name: string;
    surname: string;
  }[];
}

export interface UnregisterProps {
  onSubmit: SubmitHandler<UnregisterFormData>;
}

export function Unregister({ onSubmit = action('submit') }: UnregisterProps) {
  const [hidden, setHidden] = useState(() => new Set<Path<UnregisterFormData> | 'form'>());
  const { handleSubmit, control } = useForm<UnregisterFormData>({});
  const lens = useLens({ control });

  const toggleHidden = (path: Path<UnregisterFormData> | 'form') => {
    setHidden((prev) => prev.symmetricDifference(new Set([path])));
  };

  const formToggleButton = (
    <button type="button" onClick={() => toggleHidden('form')}>
      Toggle whole form
    </button>
  );

  if (hidden.has('form')) {
    return formToggleButton;
  }

  return (
    <>
      {formToggleButton}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <button type="button" onClick={() => toggleHidden('username')}>
            Toggle
          </button>
          {!hidden.has('username') && <StringInput lens={lens.focus('username')} label="username" shouldUnregister />}
        </div>

        <div>
          <button type="button" onClick={() => toggleHidden('age')}>
            Toggle
          </button>
          {!hidden.has('age') && <NumberInput lens={lens.focus('age')} label="age" shouldUnregister />}
        </div>

        <div>
          <button type="button" onClick={() => toggleHidden('deep.nested.value')}>
            Toggle
          </button>
          {!hidden.has('deep.nested.value') && (
            <StringInput lens={lens.focus('deep').focus('nested').focus('value')} label="nested.value" shouldUnregister />
          )}
        </div>

        <div>
          <button type="button" onClick={() => toggleHidden('deep.another')}>
            Toggle
          </button>
          {!hidden.has('deep.another') && <StringInput lens={lens.focus('deep.another')} label="another" shouldUnregister />}
        </div>

        <div>
          <button type="button" onClick={() => toggleHidden('children')}>
            Toggle
          </button>
          {!hidden.has('children') && <ChildForm lens={lens.focus('children')} />}
        </div>

        <div>
          <button type="submit">submit</button>
        </div>
      </form>
    </>
  );
}

function ChildForm({ lens }: { lens: Lens<{ name: string; surname: string }[]> }) {
  const { fields, append, remove } = useFieldArray({ ...lens.interop(), shouldUnregister: true });

  return (
    <div>
      <button type="button" onClick={() => append({ name: '', surname: '' })}>
        Add child
      </button>
      {lens.map(fields, (value, l, index) => (
        <PersonForm key={value.id} lens={l} onRemove={() => remove(index)} />
      ))}
    </div>
  );
}

function PersonForm({ lens, onRemove }: { lens: Lens<{ name: string; surname: string }>; onRemove: () => void }) {
  return (
    <div>
      <StringInput lens={lens.focus('name')} label="name" shouldUnregister />
      <StringInput lens={lens.focus('surname')} label="surname" shouldUnregister />
      <button type="button" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}
