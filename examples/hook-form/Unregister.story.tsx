import { useState } from 'react';
import { type Path, type SubmitHandler, useForm } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { useFieldArray } from '@hookform/lenses/rhf';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { NumberInput, StringInput } from '../components';

const meta = {
  title: 'Hook-Form',
  component: Playground,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

interface PlaygroundData {
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

interface PlaygroundProps {
  onSubmit: SubmitHandler<PlaygroundData>;
}

function Playground({ onSubmit = action('submit') }: PlaygroundProps) {
  const [hidden, setHidden] = useState(() => new Set<Path<PlaygroundData> | 'form'>());
  const { handleSubmit, control } = useForm<PlaygroundData>({});
  const lens = useLens({ control });

  const toggleHidden = (path: Path<PlaygroundData> | 'form') => {
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
          <input type="submit" />
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

export const Unregister: Story = {
  args: {
    onSubmit: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));

    expect(args.onSubmit).toHaveBeenCalledWith(
      {
        age: NaN,
        children: [],
        deep: {
          another: '',
          nested: {
            value: '',
          },
        },
        username: '',
      },
      expect.anything(),
    );
  },
};
