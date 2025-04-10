import { Control, useController, useForm } from 'react-hook-form';
import { HookFormControlShim, ShimKeyName, useLens } from '@hookform/lenses';
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
    control: Control<HookFormControlShim<string>>;
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
    interopControl: Control<HookFormControlShim<string>>;
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

test('interop can hold the union value of the field', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string | number }>();
    const lens = useLens({ control: form.control });
    const interop = lens.focus('a').interop();
    const ctrl = useController(interop);
    return { lens, form, ctrl };
  });

  const interop = result.current.lens.focus('a').interop((interopControl, interopName) => ({ interopName, interopControl }));

  expectTypeOf(result.current.ctrl.field.value).toEqualTypeOf<string | number>();

  expect(interop.interopName).toBe('a');
  expect(interop.interopControl).toBe(result.current.form.control);
});

test('interop can hold the literal union value of the field', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ type: 'admin' | 'general' }>();
    const lens = useLens({ control: form.control });
    const ctrl = useController(lens.focus('type').interop());
    return { lens, form, ctrl };
  });

  const interop = result.current.lens.focus('type').interop((interopControl, interopName) => ({ interopName, interopControl }));

  expectTypeOf(result.current.ctrl.field.value).toEqualTypeOf<'admin' | 'general'>();

  expect(interop.interopName).toBe('type');
  expect(interop.interopControl).toBe(result.current.form.control);
});
