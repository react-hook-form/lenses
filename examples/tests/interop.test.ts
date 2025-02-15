import { Control, useController, useForm } from 'react-hook-form';
import { NonObjectFieldShim, ShimKeyName, useLens } from '@hookform/lenses';
import { renderHook } from '@testing-library/react';
import { expectTypeOf } from 'vitest';

test('interop returns name and control', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return { lens, form };
  });

  const interop = result.current.lens.focus('a').interop();

  expectTypeOf(interop).toEqualTypeOf<{
    name: ShimKeyName;
    control: Control<NonObjectFieldShim<string>>;
  }>();

  expect(interop.name).toBe('a');
  expect(interop.control).toBe(result.current.form.control);
});

test('interop can be used with a callback', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return { lens, form };
  });

  const interop = result.current.lens.focus('a').interop((interopControl, interopName) => ({ interopName, interopControl }));

  expectTypeOf(interop).toEqualTypeOf<{
    interopName: ShimKeyName;
    interopControl: Control<NonObjectFieldShim<string>>;
  }>();

  expect(interop.interopName).toBe('a');
  expect(interop.interopControl).toBe(result.current.form.control);
});

test('interop can hold the value of the field', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: { b: { c: string }; d: { e: string } } }>();
    const lens = useLens({ control: form.control });
    const ctrl = useController(lens.focus('a').interop());
    return { lens, form, ctrl };
  });

  const interop = result.current.lens.focus('a').interop((interopControl, interopName) => ({ interopName, interopControl }));

  expectTypeOf(result.current.ctrl.field.value).toEqualTypeOf<{
    b: { c: string };
    d: { e: string };
  }>();

  expect(interop.interopName).toBe('a');
  expect(interop.interopControl).toBe(result.current.form.control);
});
