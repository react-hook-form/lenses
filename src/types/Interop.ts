import type { Control, FieldValues } from 'react-hook-form';

export interface HookFormControlShim<T> {
  __DO_NOT_USE_HOOK_FORM_CONTROL_SHIM__: T;
}

export type ShimKeyName = keyof HookFormControlShim<unknown>;

export interface LensInteropBinding<T extends FieldValues, Name> {
  control: Control<T>;
  name: Name;
}

export interface LensInteropFunction<T extends FieldValues, Name, R> {
  (control: LensInteropBinding<T, Name>['control'], name: LensInteropBinding<T, Name>['name']): R;
}

export interface LensInterop<T> {
  interop(): LensInteropBinding<HookFormControlShim<T>, ShimKeyName>;
  interop<R>(callback: LensInteropFunction<HookFormControlShim<T>, ShimKeyName, R>): R;
}
