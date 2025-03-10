import { composeStories } from '@storybook/react';
import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';

import * as stories from './Reflect.story';

const { Reflect, ArrayReflect } = composeStories(stories);

test('should change lens via reflect', async () => {
  const handleSubmit = vi.fn();
  render(<Reflect onSubmit={handleSubmit} />);

  await user.type(screen.getByPlaceholderText(/firstName/i), 'joe');
  await user.type(screen.getByPlaceholderText(/lastName/i), 'doe');

  await user.click(screen.getByText(/submit/i));

  expect(handleSubmit).toHaveBeenCalledWith(
    {
      firstName: 'joe',
      lastName: { value: 'doe' },
    } satisfies stories.ReflectFormData,
    expect.anything(),
  );
});

test('should change array lens via reflect', async () => {
  const handleSubmit = vi.fn();
  render(<ArrayReflect onSubmit={handleSubmit} />);

  expect(screen.getByPlaceholderText('items.0.value.inside')).toHaveValue('one');
  expect(screen.getByPlaceholderText('items.1.value.inside')).toHaveValue('two');
  expect(screen.getByPlaceholderText('items.2.value.inside')).toHaveValue('three');

  await user.click(screen.getByText(/Add item/i));

  await user.type(screen.getByPlaceholderText('items.3.value.inside'), ' four');
  expect(screen.getByPlaceholderText('items.3.value.inside')).toHaveValue('more four');

  await user.click(screen.getByText(/submit/i));

  expect(handleSubmit).toHaveBeenCalledWith(
    {
      items: [
        { value: { inside: 'one' } },
        { value: { inside: 'two' } },
        { value: { inside: 'three' } },
        { value: { inside: 'more four' } },
      ],
    } satisfies stories.ArrayReflectFormData,
    expect.anything(),
  );
});
