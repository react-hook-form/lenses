import { useForm } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { useFieldArray } from '@hookform/lenses/rhf';
import { renderHook } from '@testing-library/react';
import { expectTypeOf } from 'vitest';

test('reflect can create a new lens from a field array item', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string[] }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  expectTypeOf(result.current.reflect((l) => ({ b: l.a.focus('0') }))).toEqualTypeOf<Lens<{ b: string }>>();
});

test('reflect can work with array', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ items: { value: string }[] }>({ defaultValues: { items: [{ value: 'one' }, { value: 'two' }] } });

    const lens = useLens({ control: form.control })
      .focus('items')
      .reflect((l) => [{ another: l.value }]);

    const arr = useFieldArray(lens.interop());

    return { form, lens, arr };
  });

  expectTypeOf(result.current.lens).toEqualTypeOf<Lens<{ another: string }[]>>();

  const [one, two] = result.current.lens.map(result.current.arr.fields, (_, l) => l.focus('another').interop());

  expect(one).toEqual({
    name: 'items.0.value',
    control: result.current.form.control,
  });
  expect(two).toEqual({
    name: 'items.1.value',
    control: result.current.form.control,
  });
});
