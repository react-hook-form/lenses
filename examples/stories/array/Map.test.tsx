import { composeStories } from '@storybook/react';
import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';

import * as stories from './Map.story';

const { Map } = composeStories(stories);

test('adds nested array elements', async () => {
  const handleSubmit = vi.fn();
  render(<Map onSubmit={handleSubmit} />);

  await user.click(screen.getByRole('button', { name: /add item/i }));
  await user.type(screen.getByPlaceholderText(/items\.0\.value/i), 'one');

  await user.click(screen.getByRole('button', { name: /add item/i }));
  await user.type(screen.getByPlaceholderText(/items\.1\.value/i), 'two');

  await user.click(screen.getByRole('button', { name: /add item/i }));
  await user.type(screen.getByPlaceholderText(/items\.2\.value/i), 'three');

  await user.click(screen.getByText(/submit/i));

  expect(handleSubmit).toHaveBeenCalledWith(
    {
      items: [{ value: 'one' }, { value: 'two' }, { value: 'three' }],
    },
    expect.anything(),
  );
});
