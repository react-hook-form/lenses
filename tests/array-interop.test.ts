import { useForm, useWatch } from 'react-hook-form';
import { type HookFormControlShim, type LensInteropTransformerBinding, useLens } from '@hookform/lenses';
import { renderHook } from '@testing-library/react';
import { expectTypeOf } from 'vitest';

test('interop returns name and control', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: { b: string }[] }>();
    const lens = useLens({ control: form.control });
    return { lens, form };
  });

  const interop = result.current.lens.focus('a').interop();

  expectTypeOf(interop).toEqualTypeOf<
    LensInteropTransformerBinding<
      HookFormControlShim<
        {
          b: string;
        }[]
      >,
      '__DO_NOT_USE_HOOK_FORM_CONTROL_SHIM__',
      'id'
    >
  >();

  expect(interop.name).toBe('a');
  expect(interop.control).toBe(result.current.form.control);
});

test('interop return can be used in watch', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: { b: string }[] }>();
    const lens = useLens({ control: form.control });
    const interop = lens.focus('a').interop();
    const value = useWatch(interop);
    return { lens, form, value };
  });

  expectTypeOf(result.current.value).toEqualTypeOf<
    {
      b: string;
    }[]
  >();
});
