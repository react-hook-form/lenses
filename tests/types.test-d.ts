import type { Lens, UnwrapLens } from '@hookform/lenses';
import { expectTypeOf } from 'vitest';

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
