import { composeStories } from '@storybook/react';
import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';

import * as stories from './ItemFocus.story';

const { ItemFocus } = composeStories(stories);

test('register via lens', async () => {
  const handleSubmit = vi.fn();
  render(<ItemFocus onSubmit={handleSubmit} />);

  await user.type(screen.getByPlaceholderText(/items.0.id/i), 'one');
  await user.type(screen.getByPlaceholderText(/items.0.value/i), 'one value');
  await user.type(screen.getByPlaceholderText(/items.1.id/i), 'two');
  await user.type(screen.getByPlaceholderText(/items.1.value/i), 'two value');

  await user.click(screen.getByText(/submit/i));

  expect(handleSubmit).toHaveBeenCalledWith(
    {
      items: [
        {
          id: 'one',
          value: 'one value',
        },
        {
          id: 'two',
          value: 'two value',
        },
      ],
    },
    expect.anything(),
  );
});
