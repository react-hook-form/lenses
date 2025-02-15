import { useForm } from 'react-hook-form';
import { Lens, useLens } from '@hookform/lenses';
import { renderHook } from '@testing-library/react';
import { expectTypeOf } from 'vitest';

test('lens can merge with another lens', () => {
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

  expectTypeOf(form1.current.join(form2.current, (l1, l2) => ({ a: l1.focus('a'), b: l2.focus('b') }))).toEqualTypeOf<
    Lens<{ a: string; b: number }>
  >();

  expectTypeOf(form1.current.join(form2.current, (l1, l2) => ({ c: l1.focus('a'), d: l2.focus('b') }))).toEqualTypeOf<
    Lens<{ c: string; d: number }>
  >();
});
