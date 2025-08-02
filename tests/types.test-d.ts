/* eslint-disable @typescript-eslint/no-unused-vars */
import { useForm } from 'react-hook-form';
import { type Lens, type UnwrapLens, useLens } from '@hookform/lenses';
import { zodResolver } from '@hookform/resolvers/zod';
import { expectTypeOf } from 'vitest';
import { z } from 'zod';

test('lens should use output type of the Controller', () => {
  const schema = z.object({
    id: z.number().transform((val) => val.toString()),
  });

  type Input = z.input<typeof schema>;
  type Output = z.output<typeof schema>;

  expectTypeOf<Input>().toEqualTypeOf<{ id: number }>();
  expectTypeOf<Output>().toEqualTypeOf<{ id: string }>();

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const lens = useLens({ control: form.control });
  expectTypeOf<typeof lens>().toEqualTypeOf<Lens<Output>>();
});

test('lens unwraps to the original type', () => {
  expectTypeOf<UnwrapLens<Lens<{ a: string }>>>().toEqualTypeOf<{ a: string }>();
  expectTypeOf<UnwrapLens<Lens<{ a: string[] }>>>().toEqualTypeOf<{ a: string[] }>();
  expectTypeOf<UnwrapLens<Lens<{ a: { b: string[] } }>>>().toEqualTypeOf<{ a: { b: string[] } }>();

  expectTypeOf<
    UnwrapLens<
      Lens<{
        a: { b: { c: string }; e: number; f: { g: boolean }[] };
      }>
    >
  >().toEqualTypeOf<{
    a: { b: { c: string }; e: number; f: { g: boolean }[] };
  }>();
});

test('unwrap can handle nested lenses', () => {
  expectTypeOf<
    UnwrapLens<
      Lens<{
        a: Lens<{ b: Lens<{ c: Lens<string> }>; e: Lens<number>; f: Lens<{ g: Lens<boolean> }[]> }>;
      }>
    >
  >().toEqualTypeOf<{
    a: {
      b: {
        c: string;
      };
      e: number;
      f: {
        g: boolean;
      }[];
    };
  }>();
});

test('lens can handle optional fields', () => {
  function stringOnly(props: { lens: Lens<string> }) {
    return props;
  }

  function stringOrUndefined(props: { lens: Lens<string | undefined> }) {
    return props;
  }

  const lens = {} as Lens<{ value: string; valueOrUndefined?: string }>;

  const value = lens.focus('value');
  const valueOrUndefined = lens.focus('valueOrUndefined');

  expectTypeOf<UnwrapLens<typeof value>>().toEqualTypeOf<string>();
  expectTypeOf<UnwrapLens<typeof valueOrUndefined>>().toEqualTypeOf<string | undefined>();

  stringOnly({ lens: value });
  stringOrUndefined({ lens: value });
  stringOrUndefined({ lens: valueOrUndefined });
});
