import { useForm } from 'react-hook-form';
import { Lens, useLens } from '@hookform/lenses';
import { useFieldArray } from '@hookform/lenses/rhf';
import { renderHook } from '@testing-library/react';
import { expectTypeOf } from 'vitest';

test('reflect can create a new lens', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  expectTypeOf(result.current.reflect((l) => ({ b: l.focus('a') }))).toEqualTypeOf<Lens<{ b: string }>>();
});

test('spread operator is not allowed for lenses', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  // @ts-expect-error spread operator is not allowed for lenses
  assertType(result.current.reflect((l) => ({ ...l })));
});

test('reflect can create a new lens from a field array item', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string[] }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  expectTypeOf(result.current.reflect((l) => ({ b: l.focus('a').focus('0') }))).toEqualTypeOf<Lens<{ b: string }>>();
});

test('non lens fields cannot returned from reflect', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  // @ts-expect-error non lens fields cannot be returned from reflect
  assertType(result.current.reflect((l) => ({ b: l.focus('a'), w: 'hello' })));
});

test('reflect can add props from another lens', () => {
  const { result: form1 } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  const { result: form2 } = renderHook(() => {
    const form = useForm<{ b: number }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  expectTypeOf(form1.current.reflect((l) => ({ c: l.focus('a'), d: form2.current.focus('b') }))).toEqualTypeOf<
    Lens<{ c: string; d: number }>
  >();
});

test('reflect can work with array', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ items: { value: string }[] }>({ defaultValues: { items: [{ value: 'one' }, { value: 'two' }] } });

    const lens = useLens({ control: form.control })
      .focus('items')
      .reflect((l) => [{ another: l.focus('value') }]);

    const arr = useFieldArray(lens.interop());

    return { form, lens, arr };
  });

  expectTypeOf(result.current.lens).toEqualTypeOf<Lens<{ another: string }[]>>();

  const [one, two] = result.current.lens.map(result.current.arr.fields, (_, l) => l.focus('another').interop());

  expect(one).toEqual({
    name: 'items.0.value',
    control: result.current.form.control,
    lens: result.current.lens.focus('0').focus('another'),
  });
  expect(two).toEqual({
    name: 'items.1.value',
    control: result.current.form.control,
    lens: result.current.lens.focus('1').focus('another'),
  });
});
