import type { Control, FieldValues } from 'react-hook-form';

/**
 * This is a trick to allow `control` to have typed `Control<T>` type.
 * Because `Lens` doesn't have prop path in its types you can't use it with `Control` as is.
 *
 * For example this code is not valid:
 *
 * ```tsx
 * function Test({ control }: { control: Control<string> }) {}
 * ```
 * To provide type checking we can simulate that `T` is an object with one field and then immediately use it:
 *
 * ```tsx
 * function Test({ control }: { control: Control<{ __DO_NOT_USE_NON_OBJECT_FIELD_SHIM__: number }> }) {
 *   const { field } = useController({ control, name: '__DO_NOT_USE_NON_OBJECT_FIELD_SHIM__' });
 *   console.log(field.value); // field.value is number
 * }
 * ```
 *
 * This trick is needed for type checking. When you use `lens.interop()` it returns correct `name` in runtime.
 *
 * ```tsx
 * function Test({ lens }: { lens: Lens<number> }) {
 *   const { field } = useController(lens.interop());
 *   console.log(field.value); // field.value is number
 * }
 * ```
 */
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
  /**
   * This method returns `name` and `control` properties from react-hook-form.
   *
   * @example
   * ```tsx
   * function App() {
   *   const { control, handleSubmit } = useForm<{
   *     firstName: string;
   *   }>();
   *
   *   const lens = useLens({ control });
   *   const interop = lens.focus('firstName').interop();
   *
   *   return (
   *     <form onSubmit={handleSubmit(console.log)}>
   *       <input {...interop.control.register(interop.name)} />
   *       <input type="submit" />
   *     </form>
   *   );
   * }
   * ```
   */
  interop(): LensInteropBinding<HookFormControlShim<T>, ShimKeyName>;

  /**
   * This method allows you to use `control` and `name` properties from react-hook-form in a callback.
   *
   * @example
   * ```tsx
   * function App() {
   *   const { control, handleSubmit } = useForm<{
   *     firstName: string;
   *   }>();
   *
   *   const lens = useLens({ control });
   *
   *   return (
   *     <form onSubmit={handleSubmit(console.log)}>
   *       <input {...lens.focus('firstName').interop((ctrl, name) => ctrl.register(name))} />
   *       <input type="submit" />
   *     </form>
   *   );
   * }
   * ```
   */
  interop<R>(callback: LensInteropFunction<HookFormControlShim<T>, ShimKeyName, R>): R;
}

export interface TopLensInteropBinding<T extends FieldValues> {
  control: Control<T>;
  name: undefined;
}

export interface TopLevelLensInterop<T extends FieldValues> {
  interop(): TopLensInteropBinding<T>;
}
