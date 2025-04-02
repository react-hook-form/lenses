import type { HookFormControlShim, LensInteropBinding, ShimKeyName } from './Interop';
import type { Lens, LensesGetter, UnwrapLens } from './Lens';

export interface PrimitiveLensGetter<T, R> {
  (dictionary: never, lens: Lens<T>): LensesGetter<R>;
}

export interface PrimitiveLens<T> {
  reflect<R>(getter: PrimitiveLensGetter<T, R>): Lens<UnwrapLens<R>>;
  interop(): LensInteropBinding<HookFormControlShim<T>, ShimKeyName>;
}
