import { useForm } from 'react-hook-form';
import { Lens, useLens } from '@hookform/lenses';
import { renderHook } from '@testing-library/react';
import { expectTypeOf } from 'vitest';

test('lens can be created', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return { lens, form };
  });

  expectTypeOf(result.current.lens).toEqualTypeOf<Lens<{ a: string }>>();
  expect(result.current.lens.interop()).toEqual({ name: '', control: result.current.form.control });
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
