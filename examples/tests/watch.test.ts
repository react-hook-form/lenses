import { useForm, useWatch as useWatchRhf } from 'react-hook-form';
import { useLens } from '@hookform/lenses';
import { renderHook } from '@testing-library/react';

import { useWatch } from '../../src/rhf/useWatch';

test('watch: can get values', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>({
      defaultValues: {
        a: 'test_a',
      },
    });
    const lens = useLens({ control: form.control });
    const watch = useWatch(lens.interop());
    const rhfWatch = useWatchRhf(lens.interop());
    return { lens, form, watch, rhfWatch };
  });

  expect(result.current.watch.a).toBe('test_a');
  // FIXME?: non-focused lens becomes undefined with useWatch in react-hook-form.
  expect(result.current.rhfWatch).toBeUndefined();
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
    const watch = useWatch(lens.focus('introduction').interop());
    const rhfWatch = useWatchRhf(lens.focus('introduction').interop());
    return { lens, form, watch, rhfWatch };
  });

  expect(result.current.watch.message).toBe('Hello');
  // @ts-expect-error
  expect(result.current.watch.first).toBeUndefined();

  expect(result.current.rhfWatch.__DO_NOT_USE_HOOK_FORM_CONTROL_SHIM__?.message).toBeUndefined();
  // @ts-expect-error
  expect(result.current.rhfWatch.message).toBe('Hello');
});

test('watch: can get values only for multiple focusing values', () => {
  const { result } = renderHook(() => {
    const form = useForm<{
      introduction: {
        message: string;
        hobby: {
          name: string;
        };
      };
    }>({
      defaultValues: {
        introduction: {
          message: 'Hello',
          hobby: {
            name: 'Baseball',
          },
        },
      },
    });
    const lens = useLens({ control: form.control });
    const watch = useWatch(lens.focus('introduction.hobby').interop());
    const rhfWatch = useWatchRhf(lens.focus('introduction.hobby').interop());
    return { lens, form, watch, rhfWatch };
  });

  expect(result.current.watch.name).toBe('Baseball');
  expect(result.current.rhfWatch.__DO_NOT_USE_HOOK_FORM_CONTROL_SHIM__?.name).toBeUndefined();
  // @ts-expect-error
  expect(result.current.rhfWatch.name).toBe('Baseball');
});
