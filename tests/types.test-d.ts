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

test('should support union types', () => {
  interface Dog {
    type: 'dog';
    value: { canBark: boolean };
  }

  interface Cat {
    type: 'cat';
    value: { canMeow: boolean };
  }

  const form = useForm<Dog>();
  const lens = useLens({ control: form.control });

  expectTypeOf<UnwrapLens<typeof lens>>().toEqualTypeOf<Dog>();

  function check(props: { lens: Lens<Dog | Cat> }) {
    const lensType = props.lens.focus('type');
    expectTypeOf<UnwrapLens<typeof lensType>>().toEqualTypeOf<'dog' | 'cat'>();

    return props;
  }

  check({ lens });
});

test('should allow focusing all fields in union type', () => {
  interface Dog {
    type: 'dog';
    value: { canBark: boolean };
  }

  interface Cat {
    type: 'cat';
    value: { canMeow: boolean };
  }

  const form = useForm<Dog>();
  const lens = useLens({ control: form.control });

  function check(props: { lens: Lens<Dog | Cat> }) {
    const typeLens = props.lens.focus('type');
    const valueLens = props.lens.focus('value');
    const canBarkLens = props.lens.focus('value.canBark');
    const canMeowLens = props.lens.focus('value.canMeow');

    expectTypeOf<UnwrapLens<typeof typeLens>>().toEqualTypeOf<'dog' | 'cat'>();
    expectTypeOf<UnwrapLens<typeof valueLens>>().toEqualTypeOf<{ canBark: boolean } | { canMeow: boolean }>();
    expectTypeOf<UnwrapLens<typeof canBarkLens>>().toEqualTypeOf<boolean>();
    expectTypeOf<UnwrapLens<typeof canMeowLens>>().toEqualTypeOf<boolean>();

    return props;
  }

  check({ lens });
});
