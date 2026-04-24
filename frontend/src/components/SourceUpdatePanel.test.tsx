import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SourceUpdatePanel from './SourceUpdatePanel';
import { AppConfig, AppSource, SourceValidationResult, UpdateCheckResult, sourceService, updateService } from '../services/api';

vi.mock('../services/api', async () => {
  const actual = await vi.importActual<typeof import('../services/api')>('../services/api');
  return {
    ...actual,
    sourceService: {
      ...actual.sourceService,
      validate: vi.fn(),
      attachToApp: vi.fn(),
    },
    updateService: {
      ...actual.updateService,
      check: vi.fn(),
    },
  };
});

const app: AppConfig = {
  id: 'app-1',
  name: 'Release Monitor',
  description: 'Tracks releases',
  url: 'https://example.com',
  createdAt: '2026-04-24T09:00:00.000Z',
  updatedAt: '2026-04-24T09:00:00.000Z',
};

describe('SourceUpdatePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates, attaches, and displays update trust state', async () => {
    const validationResponse: SourceValidationResult = {
      sourceType: 'github',
      sourceUrl: 'https://github.com/example/repo/releases',
      metadata: {
        title: 'Example Repo',
        owner: 'example',
      },
      releaseCount: 3,
    };

    const attachedSource: AppSource = {
      id: 'source-1',
      appId: app.id,
      sourceType: 'github',
      sourceUrl: validationResponse.sourceUrl,
      metadata: validationResponse.metadata,
      createdAt: '2026-04-24T09:05:00.000Z',
    };

    const updateResponse: UpdateCheckResult = {
      appId: app.id,
      status: 'update_available',
      checkedAt: '2026-04-24T09:10:00.000Z',
      sourceType: 'github',
      sourceUrl: validationResponse.sourceUrl,
      release: {
        version: '2.0.0',
        tag: 'v2.0.0',
        publishedAt: '2026-04-24T08:30:00.000Z',
        artifacts: [],
      },
      artifact: {
        name: 'app-release.apk',
        type: 'apk',
        platform: 'android',
        url: 'https://example.com/app-release.apk',
        size: 1024,
        verificationStatus: 'verified',
        integrity: {
          algorithm: 'sha256',
          value: 'abc123',
          source: 'github-release',
        },
        trustSignals: {
          installable: true,
          checksumPresent: true,
          sourceMetadataCoherent: true,
          policyCompatible: true,
        },
      },
    };

    vi.mocked(sourceService.validate).mockResolvedValue({ data: validationResponse } as Awaited<ReturnType<typeof sourceService.validate>>);
    vi.mocked(sourceService.attachToApp).mockResolvedValue({ data: attachedSource } as Awaited<ReturnType<typeof sourceService.attachToApp>>);
    vi.mocked(updateService.check).mockResolvedValue({ data: updateResponse } as Awaited<ReturnType<typeof updateService.check>>);

    render(<SourceUpdatePanel app={app} />);

    await userEvent.type(screen.getByLabelText('Source URL'), validationResponse.sourceUrl);
    await userEvent.click(screen.getByRole('button', { name: 'Validate source' }));

    await waitFor(() => expect(screen.getByText('Validated github source')).toBeInTheDocument());
    expect(screen.getByText(/Releases discovered: 3/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Attach to app' }));
    await waitFor(() => expect(screen.getByText('Attached sources')).toBeInTheDocument());
    expect(screen.getAllByText(/Example Repo/).length).toBeGreaterThanOrEqual(1);

    await userEvent.click(screen.getByRole('button', { name: 'Check Android updates' }));
    await waitFor(() => expect(screen.getByText('Update available')).toBeInTheDocument());
    expect(screen.getByText(/app-release.apk - apk - verified/)).toBeInTheDocument();
    expect(screen.getByText(/Integrity: sha256 from github-release/)).toBeInTheDocument();
    expect(screen.getByText('Installable: yes')).toBeInTheDocument();
  });
});
