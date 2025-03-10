import { useForm } from 'react-hook-form';
import { Lens, useLens } from '@hookform/lenses';
import { renderHook } from '@testing-library/react';
import { expectTypeOf } from 'vitest';

test('map can create a new lens', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ items: { a: string }[] }>();
    const lens = useLens({ control: form.control });
    return { lens, form };
  });

  expectTypeOf(result.current.lens).toEqualTypeOf<Lens<{ items: { a: string }[] }>>();

  const itemLenses = result.current.lens.focus('items').map([{ a: '1' }, { a: '2' }], (item) => item.focus('a'));

  expectTypeOf(itemLenses).toEqualTypeOf<Lens<string>[]>();

  expect(itemLenses[0]?.interop()).toEqual({ name: 'items.0.a', control: result.current.form.control, lens: itemLenses[0] });
  expect(itemLenses[1]?.interop()).toEqual({ name: 'items.1.a', control: result.current.form.control, lens: itemLenses[1] });
});

test('map callback accepts a keyName and index', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ items: { a: string; myId: string }[] }>();
    const lens = useLens({ control: form.control });
    return { lens, form };
  });

  expectTypeOf(result.current.lens).toEqualTypeOf<Lens<{ items: { a: string; myId: string }[] }>>();

  const items = result.current.lens.focus('items');
  const itemLenses = items.map(
    [
      { a: '1', myId: 'one' },
      { a: '2', myId: 'two' },
    ],
    (l, keyName, index) => ({ lens: l, interop: l.interop(), keyName, index }),
    'myId',
  );

  expect(itemLenses[0]).toMatchObject({
    interop: { name: 'items.0', control: result.current.form.control, lens: itemLenses[0]?.lens },
    keyName: 'one',
    index: 0,
  });

  expect(itemLenses[1]).toMatchObject({
    interop: { name: 'items.1', control: result.current.form.control, lens: itemLenses[1]?.lens },
    keyName: 'two',
    index: 1,
  });
});
