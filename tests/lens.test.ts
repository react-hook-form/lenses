import { type Control, useForm } from 'react-hook-form';
import { type Lens, type TopLevelLens, useLens } from '@hookform/lenses';
import { renderHook } from '@testing-library/react';
import { expectTypeOf } from 'vitest';

test('lens can be created', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return { lens, form };
  });

  expectTypeOf(result.current.lens).toEqualTypeOf<TopLevelLens<{ a: string }>>();

  const aLens = result.current.lens.focus('a');
  expectTypeOf(aLens).toEqualTypeOf<Lens<string>>();
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

test('top-level lens should have undefined name', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  const interop = result.current.interop();
  expect('name' in interop).toBe(false);
});

test('top-level interop returns control', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return { lens, form };
  });

  const interop = result.current.lens.interop();

  expectTypeOf(interop).toEqualTypeOf<{
    control: Control<{ a: string }>;
  }>();

  expect(interop.control).toBe(result.current.form.control);
});
