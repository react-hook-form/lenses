import { type Control, useForm } from 'react-hook-form';
import { type HookFormControlShim, type ShimKeyName, useLens } from '@hookform/lenses';
import { renderHook } from '@testing-library/react';
import { expectTypeOf } from 'vitest';

test('interop returns name and control', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: { b: string } }>();
    const lens = useLens({ control: form.control });
    return { lens, form };
  });

  const interop = result.current.lens.focus('a.b').interop();

  expectTypeOf(interop).toEqualTypeOf<{
    name: ShimKeyName;
    control: Control<HookFormControlShim<string>>;
  }>();

  expect(interop.name).toBe('a.b');
  expect(interop.control).toBe(result.current.form.control);
});
