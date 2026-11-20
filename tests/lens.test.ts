import { useForm, useWatch } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { renderHook } from '@testing-library/react';
import { expectTypeOf } from 'vitest';

test('lens can be created', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return { lens, form };
  });

  expectTypeOf(result.current.lens).toEqualTypeOf<Lens<{ a: string }>>();
  expect(result.current.lens.interop()).toEqual({ name: undefined, control: result.current.form.control });
});

test('lenses are different when created with different forms', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens1 = useLens({ control: form.control });
    const lens2 = useLens({ control: form.control });
    return { lens1, lens2, form };
  });

  expect(result.current.lens1).not.toBe(result.current.lens2);
  expect(result.current.lens1.interop()).toEqual(result.current.lens2.interop());
  expect(result.current.form.control).toBe(result.current.lens1.interop().control);
  expect(result.current.form.control).toBe(result.current.lens2.interop().control);
});

test('root lens should be watchable when name is an empty string in LensCore', () => {
  const { result } = renderHook(() => {
    const form = useForm({
      defaultValues: {
        a: 3,
        b: 'hello',
      },
    });

    const lens = useLens({ control: form.control });
    const interop = lens.interop();
    const value = useWatch(interop);

    return { form, interop, value };
  });

  expect(result.current.interop).toEqual({ name: undefined, control: result.current.form.control });
  expect(result.current.value).toEqual({ a: 3, b: 'hello' });
  expect(result.current.value.a).toEqual(3);
  expect(result.current.value.b).toEqual('hello');
});

test('width subtyping', () => {
  const { result } = renderHook(() => {
    const form = useForm({
      defaultValues: {
        a: 3,
        b: 'hello',
        c: {
          start: new Date(),
          end: null as Date | null,
        },
        d: [{ e: 'lens', f: 3 }],
        g: ['monocle', 4],
      },
    });

    const lens = useLens({ control: form.control });
    const interop = lens.interop();
    const value = useWatch(interop);

    return { form, lens, interop, value };
  });

  // matches the selected fields exactly
  expectTypeOf(result.current.lens).toExtend<Lens<{ a: number }>>();
  expectTypeOf(result.current.lens).toExtend<Lens<{ c: { start: Date } }>>();
  expectTypeOf(result.current.lens).toExtend<Lens<{ c: { start: Date; end: Date | null } }>>();
  expectTypeOf(result.current.lens).toExtend<Lens<{ d: { e: string; f: number }[] }>>();
  expectTypeOf(result.current.lens).toExtend<Lens<{ g: Array<string | number> }>>();

  // the fields don't fully match, can't edit
  expectTypeOf(result.current.lens).not.toExtend<Lens<{ a: number | string }>>();
  expectTypeOf(result.current.lens).not.toExtend<Lens<{ c: { start: Date; end: Date } }>>();
  expectTypeOf(result.current.lens).not.toExtend<Lens<{ c: { start: Date; end: null } }>>();
  expectTypeOf(result.current.lens).not.toExtend<Lens<{ c: { start: Date | null; end: Date | null } }>>();

  // the array elements don't fully match, can't edit
  expectTypeOf(result.current.lens).not.toExtend<Lens<{ d: { e: string }[] }>>();
  expectTypeOf(result.current.lens).not.toExtend<Lens<{ g: number[] }>>();
  expectTypeOf(result.current.lens).not.toExtend<Lens<{ g: string[] }>>();
});

test('Lens<unknown> preserves its type', () => {
  const { result } = renderHook(() => {
    const form = useForm({
      defaultValues: {},
    });

    const lens = useLens({ control: form.control }) as unknown as Lens<unknown>;
    const interop = lens.interop();
    const value = useWatch(interop);

    return { form, lens, interop, value };
  });

  expectTypeOf(result.current.lens).toExtend<Lens<unknown>>();
  expectTypeOf(result.current.value).toExtend<unknown>();
});
