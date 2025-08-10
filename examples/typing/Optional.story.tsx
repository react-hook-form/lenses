import { type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { StringInput } from '../components/StringInput';

const meta = {
  title: 'Typing',
  component: Playground,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

interface FormValues {
  name?: string;
  surname?: string;
}

interface PlaygroundProps {
  onSubmit: SubmitHandler<FormValues>;
}

function Playground({ onSubmit = action('submit') }: PlaygroundProps) {
  const { handleSubmit, control } = useForm<FormValues>();
  const lens = useLens({ control });

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <UserProfile
          lens={lens.narrow<{
            name: string;
            surname: string;
          }>()}
        />
        <input type="submit" />
      </form>
    </div>
  );
}

export const Optional: Story = {
  args: {
    onSubmit: fn(),
  },
};

function UserProfile({
  lens,
}: {
  lens: Lens<{
    name: string;
    surname: string;
  }>;
}) {
  return (
    <div>
      <UserName lens={lens.focus('name')} />
      <StringInput label="Surname" lens={lens.focus('surname')} />
    </div>
  );
}

function UserName({ lens }: { lens: Lens<string> }) {
  const value = useWatch(lens.interop());

  if (value === undefined || value === null) {
    return null;
  }

  return <StringInput label="Name" lens={lens} />;
}
