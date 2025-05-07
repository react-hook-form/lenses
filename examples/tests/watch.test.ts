import { useForm, useWatch } from 'react-hook-form';
import { useLens } from '@hookform/lenses';
import { renderHook } from '@testing-library/react';

import { useWatchLens } from '../../src/useWatchLens';

test('watch: can get values', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>({
      defaultValues: {
        a: 'test_a',
      },
    });
    const lens = useLens({ control: form.control });
    const watch = useWatchLens(lens);
    const rhfWatch = useWatch({
      control: lens.interop().control,
    });
    return { lens, form, watch, rhfWatch };
  });

  const watch = result.current.watch;
  expect(watch.a).toBe('test_a');
  // @ts-expect-error
  expect(result.current.rhfWatch.a).toBe('test_a');
});

test('watch: can get values only for focusing values', () => {
  const { result } = renderHook(() => {
    const form = useForm<{
      name: { first: string; last: string };
      introduction: {
        message: string;
      };
    }>({
      defaultValues: {
        name: {
          first: 'A',
          last: 'B',
        },
        introduction: {
          message: 'Hello',
        },
      },
    });
    const lens = useLens({ control: form.control });
    const watch = useWatchLens(lens.focus('introduction'));
    const rhfWatch = useWatch({
      control: lens.interop().control,
    });
    return { lens, form, watch, rhfWatch };
  });

  const watch = result.current.watch;
  expect(watch.message).toBe('Hello');
  // @ts-expect-error
  expect(watch.first).toBeUndefined();
  // @ts-expect-error
  expect(result.current.rhfWatch.introduction.message).toBe('Hello');
});
