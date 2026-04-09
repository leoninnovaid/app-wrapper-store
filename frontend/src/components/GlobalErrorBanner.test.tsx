import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import GlobalErrorBanner from './GlobalErrorBanner';
import { useAppStore } from '../store/appStore';
import { createUiError } from '../types/errors';

describe('GlobalErrorBanner', () => {
  it('shows global errors and clears individual entries', async () => {
    const error = createUiError({
      scope: 'global',
      code: 'BACKEND_ERROR',
      message: 'Backend unavailable',
      retryable: true,
      category: 'backend',
    });

    useAppStore.getState().pushError(error);

    render(<GlobalErrorBanner />);

    expect(screen.getByText('Backend unavailable')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(screen.queryByText('Backend unavailable')).not.toBeInTheDocument();
  });
});
