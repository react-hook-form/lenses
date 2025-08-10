import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useLens } from '@hookform/lenses';
import { renderHook } from '@testing-library/react';

test('lens focus is equal to itself', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return { lens, form };
  });

  expect(result.current.lens.focus('a')).toBe(result.current.lens.focus('a'));
});

test('lens can cache by function with useCallback', () => {
  const { result, rerender } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });

    const reflectedLens = lens.reflect(useCallback((l) => ({ b: l.a }), [lens]));
    return { reflectedLens };
  });

  const a = result.current.reflectedLens;
  rerender();
  const b = result.current.reflectedLens;

  expect(a).toBe(b);
});

test('lens cannot be cache by function without useCallback', () => {
  const { result, rerender } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });

    const reflectedLens = lens.reflect((l) => ({ b: l.a }));
    return { reflectedLens };
  });

  const a = result.current.reflectedLens;
  rerender();
  const b = result.current.reflectedLens;

  expect(a).not.toBe(b);
});

test('interop return non cached name when override', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string; b: number }>();
    const lens = useLens({ control: form.control });

    return { lens };
  });

  const aLens = result.current.lens.focus('a');
  const bLens = result.current.lens.focus('b');

  expect(aLens.interop().name).toEqual('a');
  expect(bLens.interop().name).toEqual('b');

  const reflect = result.current.lens.reflect((l) => ({ a: l.b }));

  expect(reflect.focus('a').interop().name).toEqual('b');
});
