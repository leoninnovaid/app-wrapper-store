import { describe, expect, it } from 'vitest';
import { useAppStore } from './appStore';
import { createUiError } from '../types/errors';

describe('appStore error actions', () => {
  it('pushes scoped errors to both scoped and global collections', () => {
    const error = createUiError({
      scope: 'load-apps',
      code: 'NETWORK_ERROR',
      message: 'failed to load',
      retryable: true,
      category: 'network',
    });

    useAppStore.getState().pushError(error);

    const state = useAppStore.getState();
    expect(state.globalErrors).toHaveLength(1);
    expect(state.scopedErrors['load-apps']).toHaveLength(1);
  });

  it('clearError removes the entry from scoped and global arrays', () => {
    const error = createUiError({
      scope: 'create-app',
      code: 'VALIDATION_ERROR',
      message: 'validation failed',
      retryable: false,
      category: 'validation',
    });

    const store = useAppStore.getState();
    store.pushError(error);
    store.clearError(error.id);

    const state = useAppStore.getState();
    expect(state.globalErrors).toHaveLength(0);
    expect(state.scopedErrors['create-app']).toHaveLength(0);
  });

  it('clearScope removes all scope-specific errors from global and scoped collections', () => {
    const buildError = createUiError({
      scope: 'build-app',
      code: 'BACKEND_ERROR',
      message: 'build failed',
      retryable: true,
      category: 'backend',
    });

    const deleteError = createUiError({
      scope: 'delete-app',
      code: 'BACKEND_ERROR',
      message: 'delete failed',
      retryable: true,
      category: 'backend',
    });

    const store = useAppStore.getState();
    store.pushError(buildError);
    store.pushError(deleteError);

    store.clearScope('build-app');

    const state = useAppStore.getState();
    expect(state.scopedErrors['build-app']).toHaveLength(0);
    expect(state.scopedErrors['delete-app']).toHaveLength(1);
    expect(state.globalErrors.some((error) => error.id === buildError.id)).toBe(false);
    expect(state.globalErrors.some((error) => error.id === deleteError.id)).toBe(true);
  });

  it('clearAllErrors resets all error collections', () => {
    const store = useAppStore.getState();

    store.pushError(
      createUiError({
        scope: 'global',
        code: 'UNKNOWN_ERROR',
        message: 'unknown',
        retryable: false,
        category: 'unknown',
      }),
    );

    store.clearAllErrors();

    const state = useAppStore.getState();
    expect(state.globalErrors).toHaveLength(0);
    expect(state.scopedErrors['global']).toHaveLength(0);
    expect(state.scopedErrors['create-app']).toHaveLength(0);
  });
});
