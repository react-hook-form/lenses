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
