import { composeStories } from '@storybook/react';
import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';

import * as stories from './Reflect.story';

const { Reflect } = composeStories(stories);

test('should change lens via reflect', async () => {
  const handleSubmit = vi.fn();
  render(<Reflect onSubmit={handleSubmit} />);

  await user.type(screen.getByPlaceholderText(/firstName/i), 'joe');
  await user.type(screen.getByPlaceholderText(/lastName/i), 'doe');

  await user.click(screen.getByText(/submit/i));

  expect(handleSubmit).toHaveBeenCalledWith(
    {
      firstName: 'joe',
      lastName: 'doe',
    },
    expect.anything(),
  );
});
