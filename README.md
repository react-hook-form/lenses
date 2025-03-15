<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/docs/logo.png" alt="React Hook Form Logo - React hook custom hook for form validation" />
        </a>
    </p>
</div>

<p align="center">Performant, flexible and extensible forms with easy to use validation.</p>

<div align="center">

[![npm downloads](https://img.shields.io/npm/dm/@hookform/lenses.svg?style=for-the-badge)](https://www.npmjs.com/package/@hookform/lenses)
[![npm](https://img.shields.io/npm/dt/@hookform/lenses.svg?style=for-the-badge)](https://www.npmjs.com/package/@hookform/lenses)
[![npm](https://img.shields.io/bundlephobia/minzip/@hookform/lenses?style=for-the-badge)](https://bundlephobia.com/result?p=@hookform/lenses)

</div>

<p align="center">
  <a href="https://codesandbox.io/p/sandbox/headless-river-3s693c">CodeSandbox</a> |
  <a href="https://github.com/react-hook-form/lenses/tree/main/examples/stories">Examples</a>
</p>

## React Hook Form Lenses

React Hook Form Lenses is a powerful TypeScript-first library that brings the elegance of functional lenses to React Hook Form. By providing type-safe manipulation of nested form state, it enables developers to precisely control and transform complex form data with ease. The library's composable lens operations make it simple to work with deeply nested structures while maintaining type safety, leading to more maintainable and reusable form components.

### Installation

```bash
npm install @hookform/lenses
```

### Features

- **Type-Safe Form State**: Focus on specific parts of your form state with full TypeScript support and precise type inference
- **Functional Lenses**: Build complex form state transformations through composable lens operations
- **Deep Structure Support**: Handle deeply nested structures and arrays elegantly with specialized array operations
- **Seamless Integration**: Work smoothly with React Hook Form's Control API and existing functionality
- **Optimized Performance**: Each lens is cached and reused for optimal performance
- **Array Handling**: Specialized support for array fields with type-safe mapping
- **Composable API**: Build complex form state transformations through lens composition

### Quickstart

```tsx
import { useForm } from 'react-hook-form';
import { Lens, useLens } from '@hookform/lenses';
import { useFieldArray } from '@hookform/lenses/rhf';

function FormComponent() {
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
    <form onSubmit={handleSubmit(console.log)}>
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
      {lens.map(fields, (l, key) => (
        <PersonForm key={key} lens={l} />
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
```

### API Reference

#### Core Types

##### `Lens<T>`

The main lens type that provides operations based on the field type

```ts
type LensWithArray = Lens<string[]>;
type LensWithObject = Lens<{ name: string; age: number }>;
type LensWithPrimitive = Lens<string>;
```

#### Hooks

##### `useLens`

Creates a new lens instance

```tsx
const lens = useLens({
  control: form.control, // React Hook Form control
});
```

You can also pass dependencies to clear lenses with caches and re-create all of them

```tsx
const lens = useLens(
  {
    control: form.control, // React Hook Form control
  },
  [dependencies], // optional dependency array if you need to clear caches
);
```

#### Lens Operations

##### `focus`

Creates a new lens focused on a specific path

```tsx
// Type-safe path focusing
const profileLens = lens.focus('profile');
const emailLens = lens.focus('profile.contact.email');
const arrayItemLens = lens.focus('array.0');
```

##### `reflect`

Transforms the lens structure with type inference.
It is useful when you want to create a new lens from existing one with different shape to pass it to a shared component.

```tsx
const contactLens = lens.reflect((l) => ({
  name: l.focus('profile.contact.firstName'),
  phoneNumber: l.focus('profile.contact.phone'),
}));

<SharedComponent lens={contactLens} />;

function SharedComponent({ lens }: { lens: Lens<{ name: string; phoneNumber: string }> }) {
  // ...
}
```

Also, you can restructure array lens:

```tsx
function ArrayComponent({ lens }: { lens: Lens<{ value: string }[]> }) {
  return <AnotherComponent lens={lens.reflect((l) => [{ data: l.focus('value') }])} />;
}

function AnotherComponent({ lens }: { lens: Lens<{ data: string }[]> }) {
  // ...
}
```

Pay attention that in case of array reflecting you have to pass an array with single item.

In addition you can use `reflect` to merge two lenses into one.

```tsx
function Component({ lensA, lensB }: { lensA: Lens<{ firstName: string }>; lensB: Lens<{ lastName: string }> }) {
  const combined = lensA.reflect((l) => ({
    firstName: l.focus('firstName'),
    lastName: lensB.focus('lastName'),
  }));

  // ...
}
```
Keep in mind that is such case the passed to `reflect` function is longer pure.

##### `map` (Array Lenses)

Maps over array fields with `useFieldArray` integration

```tsx
import { useFieldArray } from '@hookform/lenses/rhf';

function ContactsList({ lens }: { lens: Lens<Contact[]> }) {
  const { fields } = useFieldArray(lens.interop());

  return lens.map(fields, (l, key) => <ContactForm key={key} lens={l} />);
}
```

##### `interop`

The `interop` method provides integration with react-hook-form by exposing the underlying `control` and `name` properties. This allows you to connect your lens to react-hook-form's control API.

The first variant involves calling `interop()` without arguments, which returns an object containing the `control` and `name` properties for react-hook-form.

```tsx
const { control, name } = lens.interop();

return <input {...control.register(name)} />;
```

The second variant is passing a callback function to `interop` which receives the `control` and `name` properties as arguments. This allows you to work with these properties directly within the callback scope.

```tsx
return (
  <form onSubmit={handleSubmit(console.log)}>
    <input {...lens.interop((ctrl, name) => ctrl.register(name))} />
    <input type="submit" />
  </form>
);
```

The `interop` method's return value can be passed directly to the `useController` hook from react-hook-form, providing seamless integration

```tsx
const { field, fieldState } = useController(lens.interop());

return (
  <div>
    <input {...field} />
    <p>{fieldState.error?.message}</p>
  </div>
);
```

### Caching System

All the lenses are cached to prevent component re-renders when utilizing `React.memo`.
It means that focusing the same path multiple times will not create new lens instance.

```tsx
assert(lens.focus('firstName') === lens.focus('firstName'));
```

However, there are some difficulties when you use functions, i.e. in `reflect`

```tsx
lens.reflect((l) => l.focus('firstName')))
```

To make the caching work, you need to memoize the function you pass

```tsx
lens.reflect(useCallback((l) => l.focus('firstName'), []));
```

Here is the case where [React Compiler](https://react.dev/learn/react-compiler) can be extremely helpful. Because the function you pass to `reflect` has no side effects, react compiler will hoist it to module scope and thus lens cache will work as expected.

### Advanced Usage

#### Manual Lens Creation

You can create lenses manually without `useLens` hook by utilizing the `LensCore` class:

```tsx
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { LensCore, LensesStorage } from '@hookform/lenses';

function App() {
  const { control } = useForm<{ firstName: string; lastName: string }>();

  const lens = useMemo(() => {
    const cache = new LensesStorage();
    return LensCore.create(control, cache);
  }, [control]);

  lens.focus('firstName');
  lens.focus('lastName');
}
```
