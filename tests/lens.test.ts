import type { FieldValues } from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form';
import { type Lens, LensCore, LensesStorage, useLens } from '@hookform/lenses';
import { renderHook } from '@testing-library/react';
import { expectTypeOf } from 'vitest';

test('lens can be created', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return { lens, form };
  });

  expectTypeOf(result.current.lens).toEqualTypeOf<Lens<{ a: string }>>();
  expect(result.current.lens.interop()).toEqual({ name: undefined, control: result.current.form.control });
});

test('lenses are different when created with different forms', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens1 = useLens({ control: form.control });
    const lens2 = useLens({ control: form.control });
    return { lens1, lens2, form };
  });

  expect(result.current.lens1).not.toBe(result.current.lens2);
  expect(result.current.lens1.interop()).toEqual(result.current.lens2.interop());
  expect(result.current.form.control).toBe(result.current.lens1.interop().control);
  expect(result.current.form.control).toBe(result.current.lens2.interop().control);
});

test('root lens should be watchable when name is an empty string in LensCore', () => {
  const { result } = renderHook(() => {
    const form = useForm({
      defaultValues: {
        a: 3,
        b: 'hello',
      },
    });

    const lens = useLens({ control: form.control });
    const interop = lens.interop();
    const value = useWatch(interop);

    return { form, interop, value };
  });

  expect(result.current.interop).toEqual({ name: undefined, control: result.current.form.control });
  expect(result.current.value).toEqual({ a: 3, b: 'hello' });
  expect(result.current.value.a).toEqual(3);
  expect(result.current.value.b).toEqual('hello');
});

// Create a custom LensCore class that extends the base class
class CustomLensCore<T extends FieldValues> extends LensCore<T> {
  // Add a custom method
  public getValue(): string {
    return `Custom value at path: ${this.path}`;
  }

  // Add another custom method
  public getCustomInfo(): string {
    return `CustomLensCore instance at ${this.path}`;
  }
}

test('LensCore extension should preserve custom methods when using focus()', () => {
  const { result } = renderHook(() =>
    useForm<{
      user: {
        name: string;
        email: string;
      };
    }>({
      defaultValues: {
        user: {
          name: 'John',
          email: 'john@example.com',
        },
      },
    }),
  );

  const control = result.current.control;
  const cache = new LensesStorage(control);
  const rootLens = new CustomLensCore(control, '', cache);

  // Focus on nested paths
  const userLens = rootLens.focus('user');
  const nameLens = userLens.focus('name');

  // Verify that the focused lenses are instances of CustomLensCore
  expect(userLens).toBeInstanceOf(CustomLensCore);
  expect(nameLens).toBeInstanceOf(CustomLensCore);

  // Verify that custom methods are available
  expect((userLens as CustomLensCore<any>).getValue()).toBe('Custom value at path: user');
  expect((userLens as CustomLensCore<any>).getCustomInfo()).toBe('CustomLensCore instance at user');

  expect((nameLens as CustomLensCore<any>).getValue()).toBe('Custom value at path: user.name');
  expect((nameLens as CustomLensCore<any>).getCustomInfo()).toBe('CustomLensCore instance at user.name');
});

test('LensCore extension should preserve custom methods when using reflect()', () => {
  const { result } = renderHook(() =>
    useForm<{
      profile: {
        contact: {
          firstName: string;
          phone: string;
        };
      };
    }>({
      defaultValues: {
        profile: {
          contact: {
            firstName: 'Jane',
            phone: '123-456-7890',
          },
        },
      },
    }),
  );

  const control = result.current.control;
  const cache = new LensesStorage(control);
  const rootLens = new CustomLensCore(control, '', cache);

  // Use reflect to restructure
  const contactLens = rootLens.reflect((_dictionary, l) => ({
    name: l.focus('profile.contact.firstName'),
    phoneNumber: l.focus('profile.contact.phone'),
  }));

  // Verify that the reflected lens is an instance of CustomLensCore
  expect(contactLens).toBeInstanceOf(CustomLensCore);
  expect((contactLens as CustomLensCore<any>).getValue()).toBe('Custom value at path: ');
  expect((contactLens as CustomLensCore<any>).getCustomInfo()).toBe('CustomLensCore instance at ');

  // Focus on the reflected structure
  const nameLens = contactLens.focus('name');
  expect(nameLens).toBeInstanceOf(CustomLensCore);
});

test('LensCore extension should preserve custom methods when using static create()', () => {
  const { result } = renderHook(() =>
    useForm<{
      firstName: string;
      lastName: string;
    }>({
      defaultValues: {
        firstName: 'Test',
        lastName: 'User',
      },
    }),
  );

  const control = result.current.control;
  const cache = new LensesStorage(control);

  // Use the static create method on the custom class
  const lens = CustomLensCore.create(control, cache);

  // Verify that it creates an instance of CustomLensCore
  expect(lens).toBeInstanceOf(CustomLensCore);
  expect((lens as unknown as CustomLensCore<any>).getValue()).toBe('Custom value at path: ');
  expect((lens as unknown as CustomLensCore<any>).getCustomInfo()).toBe('CustomLensCore instance at ');

  // Verify that focused lenses also preserve the custom class
  const firstNameLens = lens.focus('firstName');
  expect(firstNameLens).toBeInstanceOf(CustomLensCore);
  expect((firstNameLens as unknown as CustomLensCore<any>).getValue()).toBe('Custom value at path: firstName');
});
