import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import InlineError from './InlineError';
import { useAppStore } from '../store/appStore';
import { createUiError } from '../types/errors';

describe('InlineError', () => {
  it('renders scoped error and invokes retry callback', async () => {
    const retry = vi.fn();

    useAppStore.getState().pushError(
      createUiError({
        scope: 'load-apps',
        code: 'NETWORK_ERROR',
        message: 'Load failed',
        retryable: true,
        category: 'network',
      }),
    );

    render(<InlineError scope="load-apps" onRetry={retry} />);

    expect(screen.getByText('Load failed')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: 'Retry' });
    await userEvent.click(retryButton);

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
