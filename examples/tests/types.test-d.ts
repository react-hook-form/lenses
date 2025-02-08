import { Lens, UnwrapLens } from '@hookform/lenses';
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
