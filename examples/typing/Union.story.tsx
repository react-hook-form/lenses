import { type SubmitHandler, useForm } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { zodResolver } from '@hookform/resolvers/zod';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import * as z from 'zod';

import { Checkbox } from '../components/Checkbox';
import { Select } from '../components/Select';
import { StringInput } from '../components/StringInput';

const meta = {
  title: 'Typing',
  component: Playground,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const dogSchema = z.object({
  type: z.literal('dog'),
  value: z.object({ canBark: z.boolean() }),
});
type DogValues = z.infer<typeof dogSchema>;

const catSchema = z.object({
  type: z.literal('cat'),
  value: z.object({ canMeow: z.boolean() }),
});
type CatValues = z.infer<typeof catSchema>;

const animalSchema = z.discriminatedUnion('type', [dogSchema, catSchema]);
type AnimalValues = z.infer<typeof animalSchema>;

const formSchema = z.object({
  name: z.string(),
  animal: animalSchema,
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  name: 'Gregory',
  animal: {
    type: 'dog',
    value: {
      canBark: true,
    },
  },
};

interface PlaygroundProps {
  onSubmit: SubmitHandler<FormValues>;
}

function Playground({ onSubmit = action('submit') }: PlaygroundProps) {
  const { handleSubmit, control } = useForm({ defaultValues, mode: 'all', resolver: zodResolver(formSchema) });
  const lens = useLens({ control });

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <StringInput label="Name" lens={lens.focus('name')} />
        <AnimalFields lens={lens.focus('animal')} />
        <input type="submit" />
      </form>
    </div>
  );
}

export const Union: Story = {
  args: {
    onSubmit: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const nameInput = canvas.getByRole('textbox');
    const animalSelect = canvas.getByRole('combobox');
    const dogCheckbox = canvas.getByLabelText(/can bark/i);

    expect(dogCheckbox).toBeChecked();
    expect(animalSelect).toHaveValue('dog');

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Max');

    await userEvent.selectOptions(animalSelect, 'cat');

    expect(canvas.queryByLabelText(/can bark/i)).not.toBeInTheDocument();
    const catCheckbox = canvas.getByLabelText(/can meow/i);
    expect(catCheckbox).toBeInTheDocument();
    expect(catCheckbox).not.toBeChecked();

    await userEvent.click(catCheckbox);
    expect(catCheckbox).toBeChecked();

    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));

    expect(args.onSubmit).toHaveBeenCalledWith(
      {
        name: 'Max',
        animal: {
          type: 'cat',
          value: {
            canMeow: true,
          },
        },
      },
      expect.anything(),
    );

    await userEvent.selectOptions(animalSelect, 'dog');

    expect(canvas.queryByLabelText(/can meow/i)).not.toBeInTheDocument();
    const newDogCheckbox = canvas.getByLabelText(/can bark/i);
    expect(newDogCheckbox).toBeInTheDocument();
    expect(newDogCheckbox).not.toBeChecked();

    await userEvent.click(newDogCheckbox);
    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));

    expect(args.onSubmit).toHaveBeenLastCalledWith(
      {
        name: 'Max',
        animal: {
          type: 'dog',
          value: {
            canBark: true,
          },
        },
      },
      expect.anything(),
    );
  },
};

function AnimalFields({ lens }: { lens: Lens<AnimalValues> }) {
  const interop = lens.interop();
  const selectedType = useWatch(interop);

  const animalOptions = [
    { value: 'dog' as const, label: 'Dog' },
    { value: 'cat' as const, label: 'Cat' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Select label="Animal" lens={lens.focus('type')} options={animalOptions} />

      {selectedType.type === 'dog' ? <DogFields lens={lens.narrow('type', 'dog')} /> : null}
      {selectedType.type === 'cat' ? (lens.assert('type', selectedType.type), (<CatFields lens={lens} />)) : null}
    </div>
  );
}

function DogFields({ lens }: { lens: Lens<DogValues> }) {
  return <Checkbox label="Can Bark" lens={lens.focus('value.canBark')} shouldUnregister={true} />;
}

function CatFields({ lens }: { lens: Lens<CatValues> }) {
  return <Checkbox label="Can Meow" lens={lens.focus('value.canMeow')} shouldUnregister={true} />;
}
