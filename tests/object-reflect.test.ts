import { useForm } from 'react-hook-form';
import { type Lens, useLens } from '@hookform/lenses';
import { renderHook } from '@testing-library/react';
import { expectTypeOf } from 'vitest';

test('reflect can create a new lens', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  expectTypeOf(result.current.reflect((l) => ({ b: l.a }))).toEqualTypeOf<Lens<{ b: string }>>();
});

test('spread operator is allowed for lenses in reflect', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string; b: { c: number } }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  expectTypeOf(
    result.current.reflect((l) => {
      expectTypeOf(l).toEqualTypeOf<{
        a: Lens<string>;
        b: Lens<{
          c: number;
        }>;
      }>();

      return { ...l };
    }),
  ).toEqualTypeOf<Lens<{ a: string; b: { c: number } }>>();
});

test('non lens fields cannot returned from reflect', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  assertType(result.current.reflect((_, l) => ({ b: l.focus('a'), w: 'hello' })));
});

test('reflect can add props from another lens', () => {
  const { result: form1 } = renderHook(() => {
    const form = useForm<{ a: string }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  const { result: form2 } = renderHook(() => {
    const form = useForm<{ b: number }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  expectTypeOf(form1.current.reflect((l) => ({ c: l.a, d: form2.current.focus('b') }))).toEqualTypeOf<Lens<{ c: string; d: number }>>();
});

test('reflect return an object contains Date, File, FileList', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ date: Date; file: File; fileList: FileList }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  const reflectedLens = result.current.reflect((dic) => {
    expectTypeOf(dic.date).toEqualTypeOf<Lens<Date>>();
    expectTypeOf(dic.file).toEqualTypeOf<Lens<File>>();
    expectTypeOf(dic.fileList).toEqualTypeOf<Lens<FileList>>();

    return {
      date: dic.date,
      file: dic.file,
      fileList: dic.fileList,
    };
  });

  expectTypeOf(reflectedLens).toEqualTypeOf<
    Lens<{
      date: Date;
      file: File;
      fileList: FileList;
    }>
  >();
});

test('basic lens focus with dot notation works correctly', () => {
  const { result } = renderHook(() => {
    const form = useForm<{
      password: { password: string; passwordConfirm: string };
      usernameNest: { name: string };
    }>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  const lens = result.current;

  expect(lens.focus('password.password').interop().name).toBe('password.password');
  expect(lens.focus('usernameNest.name').interop().name).toBe('usernameNest.name');
});

test('reflected lens with chained focus calls works correctly', () => {
  type Input = {
    name: string;
    password: {
      password: string;
      passwordConfirm: string;
    };
    usernameNest: {
      name: string;
    };
  };

  type DataLens = {
    userName: string;
    password: {
      password_base: string;
      password_confirm: string;
    };
    nest2: {
      names: {
        name: string;
      };
    };
  };

  const { result } = renderHook(() => {
    const form = useForm<Input>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  const lens = result.current;

  const reflected: Lens<DataLens> = lens.reflect((dic, l) => ({
    userName: dic.name,
    password: lens.focus('password').reflect<DataLens['password']>((pas) => ({
      password_base: pas.password,
      password_confirm: pas.passwordConfirm,
    })),
    nest2: lens.reflect<DataLens['nest2']>(() => ({
      names: l.focus('usernameNest'),
    })),
  }));

  expect(reflected.focus('password').focus('password_base').interop().name).toBe('password.password');
  expect(reflected.focus('password').focus('password_confirm').interop().name).toBe('password.passwordConfirm');
  expect(reflected.focus('nest2').focus('names').focus('name').interop().name).toBe('usernameNest.name');
});

test('reflected lens with dot notation resolves correct paths', () => {
  type Input = {
    password: {
      password: string;
      passwordConfirm: string;
    };
    usernameNest: {
      name: string;
    };
  };

  type DataLens = {
    password: {
      password_base: string;
      password_confirm: string;
    };
    nest2: {
      names: {
        name: string;
      };
    };
  };

  const { result } = renderHook(() => {
    const form = useForm<Input>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  const lens = result.current;

  const reflected: Lens<DataLens> = lens.reflect((_, l) => ({
    password: lens.focus('password').reflect<DataLens['password']>((pas) => ({
      password_base: pas.password,
      password_confirm: pas.passwordConfirm,
    })),
    nest2: lens.reflect<DataLens['nest2']>(() => ({
      names: l.focus('usernameNest'),
    })),
  }));

  expect(reflected.focus('password.password_base').interop().name).toBe('password.password');
  expect(reflected.focus('password.password_confirm').interop().name).toBe('password.passwordConfirm');
  expect(reflected.focus('nest2.names.name').interop().name).toBe('usernameNest.name');
});

test('reflected lens handles duplicate key names in different nesting levels', () => {
  type Input = {
    id: string;
    nest: {
      id: string;
    };
  };

  const { result } = renderHook(() => {
    const form = useForm<Input>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  const lens = result.current;

  const reflectedWithDuplicateKeys = lens.reflect((_, l) => ({
    id: l.focus('id'),
    nest_id: l.focus('nest').focus('id'),
  }));

  expect(reflectedWithDuplicateKeys.focus('nest_id').interop().name).toBe('nest.id');
});

test('reflected lens with nested objects resolves correct paths', () => {
  type Input = {
    password: {
      password: string;
      passwordConfirm: string;
    };
    usernameNest: {
      name: string;
    };
  };

  type DataLens = {
    password: {
      password_base: string;
      password_confirm: string;
    };
    nest2: {
      names: {
        name: string;
      };
    };
  };

  const { result } = renderHook(() => {
    const form = useForm<Input>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  const lens = result.current;

  const reflected: Lens<DataLens> = lens.reflect((_, l) => ({
    password: {
      password_base: l.focus('password.password'),
      password_confirm: l.focus('password.passwordConfirm'),
    },
    nest2: {
      names: l.focus('usernameNest'),
    },
  }));

  expect(reflected.focus('password.password_base').interop().name).toBe('password.password');
  expect(reflected.focus('password.password_confirm').interop().name).toBe('password.passwordConfirm');
  expect(reflected.focus('nest2.names.name').interop().name).toBe('usernameNest.name');
});

test('reflected lenses without focus do not append paths', () => {
  type Input = {
    a: {
      b: {
        c: string;
      };
    };
  };

  type Result = {
    x: {
      y: string;
    };
  };

  const { result } = renderHook(() => {
    const form = useForm<Input>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  const lens = result.current;

  const reflected: Lens<Result> = lens.reflect((_, l) => ({
    x: l.reflect((_, l2) => {
      return {
        y: l2.focus('a.b.c'),
      };
    }),
  }));

  expect(reflected.focus('x.y').interop().name).toBe('a.b.c');
});

test('nested object reflect does not append paths', () => {
  type Input = {
    a: {
      b: {
        c: string;
      };
    };
  };

  type Result = {
    x: {
      y: string;
    };
  };

  const { result } = renderHook(() => {
    const form = useForm<Input>();
    const lens = useLens({ control: form.control });
    return lens;
  });

  const lens = result.current;

  const reflected: Lens<Result> = lens.reflect((_, l) => ({
    x: {
      y: l.focus('a.b.c'),
    },
  }));

  expect(reflected.focus('x.y').interop().name).toBe('a.b.c');
});
