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
  <a href="https://codesandbox.io/p/sandbox/keen-herschel-y5h2ft">CodeSandbox</a> |
  <a href="https://github.com/react-hook-form/lenses/tree/main/examples/stories">Examples</a> |
  <a href="https://react-hook-form.com/docs/uselens">Docs</a>
</p>

## React Hook Form Lenses

React Hook Form Lenses is a powerful TypeScript-first library that brings the elegance of functional lenses to React Hook Form. By providing type-safe manipulation of nested form state, it enables developers to precisely control and transform complex form data with ease. The library's composable lens operations make it simple to work with deeply nested structures while maintaining type safety, leading to more maintainable and reusable form components.

### Installation

```bash
npm install @hookform/lenses
```

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
        lens={lens.reflect(({ firstName, lastName }) => ({
          name: firstName,
          surname: lastName,
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
```
