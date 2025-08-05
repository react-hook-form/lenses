import React from 'react';
import { type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

const meta = {
  title: 'Typing',
  component: Playground,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

// Union type for demonstrating discriminant-based narrowing
type Animal = { type: 'dog'; breed: string; barks: boolean } | { type: 'cat'; breed: string; meows: boolean };

interface FormValues {
  // Optional fields for demonstrating defined() and manual narrowing
  name?: string;
  age?: number;

  // Union type for demonstrating discriminant narrowing and assert
  pet?: Animal;

  // For demonstrating cast() with unknown/any data
  dynamicData?: unknown;
}

interface PlaygroundProps {
  onSubmit: SubmitHandler<FormValues>;
}

function Playground({ onSubmit = action('submit') }: PlaygroundProps) {
  const { handleSubmit, control, setValue } = useForm<FormValues>({
    defaultValues: {
      pet: { type: 'dog', breed: 'Golden Retriever', barks: true },
    },
  });
  const lens = useLens({ control });

  // Simulate setting dynamic data
  React.useEffect(() => {
    setValue('dynamicData', { secretValue: 'Hello World!' });
  }, [setValue]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Toolkit Methods Demo</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 1. Manual narrowing: narrow<R>() */}
        <section style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>1. Manual Narrowing: narrow&lt;R&gt;()</h3>
          <p>Manually narrow optional string to required string:</p>
          <ManualNarrowingDemo lens={lens.focus('name')} />
        </section>

        {/* 2. defined() - exclude null/undefined */}
        <section style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>2. Defined: defined()</h3>
          <p>Exclude null/undefined from optional field:</p>
          <DefinedDemo lens={lens.focus('age')} />
        </section>

        {/* 3. Discriminant narrowing: narrow(key, value) */}
        <section style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>3. Discriminant Narrowing: narrow(key, value)</h3>
          <p>Narrow union type by discriminant property:</p>
          <DiscriminantNarrowingDemo lens={lens.focus('pet')} />
        </section>

        {/* 4. Manual assert: assert<R>() */}
        <section style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>4. Manual Assert: assert&lt;R&gt;()</h3>
          <p>Assert lens type without arguments:</p>
          <ManualAssertDemo lens={lens.focus('pet')} />
        </section>

        {/* 5. Discriminant assert: assert(key, value) */}
        <section style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>5. Discriminant Assert: assert(key, value)</h3>
          <p>Assert within conditional blocks:</p>
          <DiscriminantAssertDemo lens={lens.focus('pet')} />
        </section>

        {/* 6. Cast: cast<R>() */}
        <section style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>6. Cast: cast&lt;R&gt;()</h3>
          <p>Forcefully cast unknown data to specific type:</p>
          <CastDemo lens={lens.focus('dynamicData')} />
        </section>

        <input type="submit" value="Submit" style={{ padding: '10px 20px', fontSize: '16px' }} />
      </form>
    </div>
  );
}

export const Toolkit: Story = {
  args: {
    onSubmit: fn(),
  },
};

// 1. Manual narrowing demo
function ManualNarrowingDemo({ lens }: { lens: Lens<string | undefined> }) {
  const value = useWatch(lens.interop());

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <p>Original lens type: Lens&lt;string | undefined&gt;</p>
        <p>Current value: {value || 'undefined'}</p>
      </div>
      {value && (
        <div style={{ marginTop: '10px' }}>
          <RequiredStringComponent lens={lens.narrow<string>()} />
        </div>
      )}
    </div>
  );
}

function RequiredStringComponent({ lens }: { lens: Lens<string> }) {
  const value = useWatch(lens.interop());
  return (
    <div>
      <p>✅ Successfully narrowed to Lens&lt;string&gt;</p>
      <p>Narrowed value: {value}</p>
    </div>
  );
}

// 2. defined() demo
function DefinedDemo({ lens }: { lens: Lens<number | undefined> }) {
  const value = useWatch(lens.interop());

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <p>Original lens type: Lens&lt;number | undefined&gt;</p>
        <p>Current value: {value !== undefined ? value : 'undefined'}</p>
      </div>
      {value !== undefined && value !== null && (
        <div style={{ marginTop: '10px' }}>
          <NonNullableComponent lens={lens.defined()} />
        </div>
      )}
    </div>
  );
}

function NonNullableComponent({ lens }: { lens: Lens<number> }) {
  const value = useWatch(lens.interop());
  return (
    <div>
      <p>✅ Successfully narrowed to Lens&lt;number&gt; with defined()</p>
      <p>Defined value: {value}</p>
    </div>
  );
}

// 3. Discriminant narrowing demo
function DiscriminantNarrowingDemo({ lens }: { lens: Lens<Animal | undefined> }) {
  const value = useWatch(lens.interop());

  if (!value) {
    return <p>No pet selected</p>;
  }

  return (
    <div>
      <p>Original lens type: Lens&lt;Animal | undefined&gt;</p>
      <p>Step 1: lens.narrow&lt;Animal&gt;() → Lens&lt;Animal&gt;</p>
      <p>Step 2: Use discriminant narrowing on the result</p>
      <p>Pet type: {value.type}</p>

      {/* For demonstration purposes, showing the concept */}
      {value.type === 'dog' && (
        <div>
          <p>✅ Would use: lens.narrow&lt;Animal&gt;().narrow(&quot;type&quot;, &quot;dog&quot;) → Lens&lt;Dog&gt;</p>
          <DogComponent animal={value as Extract<Animal, { type: 'dog' }>} />
        </div>
      )}
      {value.type === 'cat' && (
        <div>
          <p>✅ Would use: lens.narrow&lt;Animal&gt;().narrow(&quot;type&quot;, &quot;cat&quot;) → Lens&lt;Cat&gt;</p>
          <CatComponent animal={value as Extract<Animal, { type: 'cat' }>} />
        </div>
      )}
    </div>
  );
}

function DogComponent({ animal }: { animal: Extract<Animal, { type: 'dog' }> }) {
  return (
    <div>
      <p>🐕 Dog breed: {animal.breed}</p>
      <p>Barks: {animal.barks ? 'Yes' : 'No'}</p>
    </div>
  );
}

function CatComponent({ animal }: { animal: Extract<Animal, { type: 'cat' }> }) {
  return (
    <div>
      <p>🐱 Cat breed: {animal.breed}</p>
      <p>Meows: {animal.meows ? 'Yes' : 'No'}</p>
    </div>
  );
}

// 4. Manual assert demo
function ManualAssertDemo({ lens: originalLens }: { lens: Lens<Animal | undefined> }) {
  const value = useWatch(originalLens.interop());

  if (!value) {
    return <p>No pet for manual assert demo</p>;
  }

  // We know it's defined, so we can assert it
  const lens: Lens<Animal | undefined> = originalLens;
  lens.assert<Animal>();

  return (
    <div>
      <p>Original lens type: Lens&lt;Animal | undefined&gt;</p>
      <p>After assert&lt;Animal&gt;(): TypeScript now treats it as Lens&lt;Animal&gt;</p>
      <AssertedAnimalComponent lens={lens} />
    </div>
  );
}

function AssertedAnimalComponent({ lens }: { lens: Lens<Animal> }) {
  const animal = useWatch(lens.interop());
  return <p>✅ Successfully asserted as Animal: {animal?.type}</p>;
}

// 5. Discriminant assert demo
function DiscriminantAssertDemo({ lens: originalLens }: { lens: Lens<Animal | undefined> }) {
  const value = useWatch(originalLens.interop());

  if (!value) {
    return <p>No pet for discriminant assert demo</p>;
  }

  // First assert it's not undefined
  const lens: Lens<Animal | undefined> = originalLens;
  lens.assert<Animal>();

  return (
    <div>
      <p>Original lens type: Lens&lt;Animal | undefined&gt;</p>
      <p>Using assert(key, value) within conditional blocks:</p>
      {value.type === 'dog' && <DogAssertDemo lens={lens} />}
      {value.type === 'cat' && <CatAssertDemo lens={lens} />}
    </div>
  );
}

function DogAssertDemo({ lens: animalLens }: { lens: Lens<Animal> }) {
  const lens: Lens<Animal> = animalLens;
  lens.assert('type', 'dog');

  return <AssertedDogComponent lens={lens} />;
}

function CatAssertDemo({ lens: animalLens }: { lens: Lens<Animal> }) {
  const lens: Lens<Animal> = animalLens;
  lens.assert('type', 'cat');

  return <AssertedCatComponent lens={lens} />;
}

function AssertedDogComponent({ lens }: { lens: Lens<Extract<Animal, { type: 'dog' }>> }) {
  const dog = useWatch(lens.interop());
  return (
    <div>
      <p>✅ Successfully asserted as Dog using assert(&quot;type&quot;, &quot;dog&quot;)</p>
      <p>Dog breed: {dog?.breed}</p>
    </div>
  );
}

function AssertedCatComponent({ lens }: { lens: Lens<Extract<Animal, { type: 'cat' }>> }) {
  const cat = useWatch(lens.interop());
  return (
    <div>
      <p>✅ Successfully asserted as Cat using assert(&quot;type&quot;, &quot;cat&quot;)</p>
      <p>Cat breed: {cat?.breed}</p>
    </div>
  );
}

// 6. Cast demo
function CastDemo({ lens }: { lens: Lens<unknown> }) {
  const value = useWatch(lens.interop());

  return (
    <div>
      <p>Original lens type: Lens&lt;unknown&gt;</p>
      <p>Unknown data: {JSON.stringify(value)}</p>
      <CastedComponent lens={lens.cast<{ secretValue: string }>()} />
    </div>
  );
}

function CastedComponent({ lens }: { lens: Lens<{ secretValue: string }> }) {
  const data = useWatch(lens.interop());
  return (
    <div>
      <p>✅ Successfully cast to Lens&lt;{`{ secretValue: string }`}&gt;</p>
      <p>⚠️ Warning: cast() is unsafe - only use when you know the shape!</p>
      <p>Secret value: {data?.secretValue}</p>
    </div>
  );
}
