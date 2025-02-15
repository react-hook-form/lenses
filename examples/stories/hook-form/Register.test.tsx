import { composeStories } from '@storybook/react';
import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';

import * as stories from './Register.story';

const { Register } = composeStories(stories);

test('register via lens', async () => {
  const handleSubmit = vi.fn();
  render(<Register onSubmit={handleSubmit} />);

  await user.type(screen.getByPlaceholderText(/username/i), 'joe');
  await user.type(screen.getByPlaceholderText(/age/i), '20');

  await user.click(screen.getByText(/submit/i));

  expect(handleSubmit).toHaveBeenCalledWith(
    {
      username: 'joe',
      age: 20,
    },
    expect.anything(),
  );
});
