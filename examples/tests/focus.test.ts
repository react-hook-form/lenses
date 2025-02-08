import { useForm } from 'react-hook-form';
import { Lens, useLens } from '@hookform/lenses';
import { renderHook } from '@testing-library/react';
import { expectTypeOf } from 'vitest';

test('lens can focus on a field', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  expectTypeOf(result.current.focus('a')).toEqualTypeOf<Lens<string>>();
});

test('lens cannot focus on a field that does not exist', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  // @ts-expect-error property does not exist
  assertType(result.current.focus('b'));
});

test('lens can focus on a field array', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string[] }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  expectTypeOf(result.current.focus('a')).toEqualTypeOf<Lens<string[]>>();
});

test('lens cannot focus on a field array that does not exist', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string[] }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  // @ts-expect-error property does not exist
  assertType(result.current.focus('b'));
});

test('lens can focus on a field array item', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string[] }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  expectTypeOf(result.current.focus('a').focus('0')).toEqualTypeOf<Lens<string>>();
  // @ts-expect-error number is not a valid index
  assertType(result.current.focus('a').focus(0));
});

test('lens can focus on a field array item', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string[] }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  expectTypeOf(result.current.focus('a').focus('0')).toEqualTypeOf<Lens<string>>();
});
