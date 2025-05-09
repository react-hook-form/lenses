import { useForm } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { renderHook } from '@testing-library/react';
import { expectTypeOf } from 'vitest';

test('reflect can create a new lens', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  expectTypeOf(result.current.reflect((l) => ({ b: l.a }))).toEqualTypeOf<Lens<{ b: string }>>();
});

test('spread operator is allowed for lenses in reflect', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string; b: { c: number } }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  expectTypeOf(
    result.current.reflect((l) => {
      expectTypeOf(l).toEqualTypeOf<{
        a: Lens<string>;
        b: Lens<{
          c: number;
        }>;
      }>();

      return { ...l };
    }),
  ).toEqualTypeOf<Lens<{ a: string; b: { c: number } }>>();
});

test('non lens fields cannot returned from reflect', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  // @ts-expect-error non lens fields cannot be returned from reflect
  assertType(result.current.reflect((_, l) => ({ b: l.focus('a'), w: 'hello' })));
});

test('reflect can add props from another lens', () => {
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

  expectTypeOf(form1.current.reflect((l) => ({ c: l.a, d: form2.current.focus('b') }))).toEqualTypeOf<Lens<{ c: string; d: number }>>();
});
