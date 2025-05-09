import { useForm } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { renderHook } from '@testing-library/react';
import { expectTypeOf } from 'vitest';

test('reflect can create a new lens from a field array item', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  const reflectedLens = result.current.focus('a').reflect((d, l) => {
    expectTypeOf(d).toEqualTypeOf<never>();
    expectTypeOf(l).toEqualTypeOf<Lens<string>>();

    return { b: l };
  });

  expectTypeOf(reflectedLens).toEqualTypeOf<Lens<{ b: string }>>();
});
