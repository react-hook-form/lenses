import type { Control, FieldValues, Path, PathValue } from 'react-hook-form';

import type { LensesMap, UnwrapLens } from './helpers';

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
export interface NonObjectFieldShim<T> {
  __DO_NOT_USE_NON_OBJECT_FIELD_SHIM__: T;
}

export type ShimKeyName = keyof NonObjectFieldShim<unknown>;

export interface HookFormInterop<T extends FieldValues, Name> {
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
  (): { name: Name; control: Control<T> };

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
  <R>(cb: (control: Control<T>, name: Name) => R): R;
}

export interface LensInterop<T> {
  interop: HookFormInterop<NonObjectFieldShim<T>, ShimKeyName>;
}

export interface LensFocus<T> {
  /**
   * This method allows you to create a new lens that focuses on a specific field in the form.
   *
   * @param path - The path to the field in the form.
   *
   * @example
   * ```tsx
   * function App() {
   *   const { control, handleSubmit } = useForm<{
   *     firstName: string;
   *     some: { nested: { field: string } };
   *     arr: { value: string }[];
   *   }>();
   *
   *   const lens = useLens({ control });
   *
   *   return (
   *     <form onSubmit={handleSubmit(console.log)}>
   *       <StringInput lens={lens.focus('firstName')} />
   *       <StringInput lens={lens.focus('some.nested.field')} />
   *       <StringInput lens={lens.focus('arr.0.value')} />
   *       <input type="submit" />
   *     </form>
   *   );
   * }
   *
   * function StringInput({ lens }: { lens: Lens<string> }) {
   *   return <input {...lens.interop((ctrl, name) => ctrl.register(name))} />;
   * }
   * ```
   */
  focus: <P extends Path<T>>(path: P) => Lens<PathValue<T, P>>;
}

export interface LensReflect<T> {
  /**
   * This method allows you to create a new lens with different shape.
   * Keep in mind that it will not change `control.name` property.
   *
   * @param getter - A function that returns an object where each field is a lens.
   *
   * @example
   * ```tsx
   * function App() {
   *   const { control, handleSubmit } = useForm<{
   *     firstName: string;
   *     lastName: string;
   *   }>();
   *
   *   const lens = useLens({ control });
   *
   *   return (
   *     <form onSubmit={handleSubmit(console.log)}>
   *       <SharedComponent
   *         lens={lens.reflect((l) => ({
   *           name: l.focus('firstName'),
   *           surname: l.focus('lastName'),
   *         }))}
   *       />
   *       <input type="submit" />
   *     </form>
   *   );
   * }
   *
   * function SharedComponent({ lens }: { lens: Lens<{ name: string; surname: string }> }) {
   *   return (
   *     <div>
   *       <StringInput lens={lens.focus('name')} />
   *       <StringInput lens={lens.focus('surname')} />
   *     </div>
   *   );
   * }
   *
   * function StringInput({ lens }: { lens: Lens<string> }) {
   *   return <input {...lens.interop((ctrl, name) => ctrl.register(name))} />;
   * }
   * ```
   */
  reflect: <T2>(getter: (original: Lens<T>) => LensesMap<T2>) => Lens<UnwrapLens<LensesMap<T2>>>;
}

export interface LensMap<T extends any[]> {
  /**
   * This method allows you to map an array lens.
   * It requires the `fields` property from form.
   *
   * @param fields - The `fields` property from `useFieldArray`.
   * @param mapper - A function similar to `Array.prototype.map` The first argument is a current array item lens.
   * @param keyName - The key name array item. It must be the `keyName` prop that you pass to `useFieldArray`.
   *
   * @example
   * ```tsx
   * function App() {
   *   const { control, handleSubmit } = useForm<{
   *     items: {
   *       value: string;
   *     }[];
   *   }>();
   *
   *   const lens = useLens({ control });
   *   const items = lens.focus('items');
   *   const { fields } = useFieldArray(items.interop());
   *
   *   return (
   *     <form onSubmit={handleSubmit(console.log)}>
   *       {items.map(fields, (l, key) => {
   *         return <StringInput key={key} lens={l.focus('value')} />;
   *       })}
   *       <input type="submit" />
   *     </form>
   *   );
   * }
   *
   * function StringInput({ lens }: { lens: Lens<string> }) {
   *   return <input {...lens.interop((ctrl, name) => ctrl.register(name))} />;
   * }
   * ```
   */
  map<F extends T, R>(fields: F, mapper: (value: F[number], item: Lens<T[number]>, index: number, array: F, lens: this) => R): R[];
}

export interface ArrayLens<T extends any[]> extends LensMap<T>, LensFocus<T> {
  reflect: <T2>(getter: (original: Lens<T[number]>) => [LensesMap<T2>]) => Lens<UnwrapLens<LensesMap<T2>>[]>;
}
export interface ObjectLens<T> extends LensFocus<T>, LensReflect<T> {}
// Will leave primitive lense interface for future use
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PrimitiveLens<T> extends LensReflect<T> {}

/**
 * This is a type that allows you to hold the type of a form element.
 *
 * ```ts
 * type LensWithArray = Lens<string[]>;
 * type LensWithObject = Lens<{ name: string; age: number }>;
 * type LensWithPrimitive = Lens<string>;
 * ```
 *
 * In runtime it has `control` and `name` to use latter in react-hook-form.
 * Each time you do `lens.focus('propPath')` it creates a lens that keeps nesting of paths.
 */
export type Lens<T> = LensInterop<T> & (T extends any[] ? ArrayLens<T> : T extends FieldValues ? ObjectLens<T> : PrimitiveLens<T>);
