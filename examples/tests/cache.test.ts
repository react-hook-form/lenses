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

    const reflectedLens = lens.reflect(useCallback((l) => ({ b: l.focus('a') }), [lens]));
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

    const reflectedLens = lens.reflect((l) => ({ b: l.focus('a') }));
    return { reflectedLens };
  });

  const a = result.current.reflectedLens;
  rerender();
  const b = result.current.reflectedLens;

  expect(a).not.toBe(b);
});
