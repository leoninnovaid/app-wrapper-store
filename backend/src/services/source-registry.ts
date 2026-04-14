import { CustomSourceAdapter } from '../adapters/custom-source-adapter';
import { FdroidSourceAdapter } from '../adapters/fdroid-source-adapter';
import { GitLabSourceAdapter } from '../adapters/gitlab-source-adapter';
import { GitHubSourceAdapter } from '../adapters/github-source-adapter';
import { ArtifactVerificationContext, SourceAdapter } from '../adapters/source-adapter';
import { ApiError } from '../errors/api-error';
import { SourceType } from '../types/domain';

class PlaceholderSourceAdapter implements SourceAdapter {
  readonly sourceType: SourceType;

  constructor(sourceType: SourceType) {
    this.sourceType = sourceType;
  }

  async validate(sourceUrl: string) {
    return {
      valid: false,
      sourceType: this.sourceType,
      normalizedUrl: sourceUrl,
      reason: `${this.sourceType} source adapter is scaffolded but not implemented yet`,
    };
  }

  async fetchMetadata(sourceUrl: string) {
    return {
      title: `${this.sourceType} source (scaffold)`,
      homepage: sourceUrl,
      description: `${this.sourceType} source integration will be implemented in a follow-up sprint.`,
    };
  }

  async listReleases() {
    return [];
  }

  pickInstallableArtifact() {
    return null;
  }

  async verifyArtifact(_release: unknown, _artifact: unknown, _context: ArtifactVerificationContext) {
    return {
      status: 'blocked' as const,
      reason: `${this.sourceType} verification flow is not implemented yet`,
    };
  }
}

const adapters: Record<SourceType, SourceAdapter> = {
  github: new GitHubSourceAdapter(),
  fdroid: new FdroidSourceAdapter(),
  gitlab: new GitLabSourceAdapter(),
  custom: new CustomSourceAdapter(),
};

export function getSourceAdapter(sourceType: SourceType): SourceAdapter {
  const adapter = adapters[sourceType];
  if (!adapter) {
    throw new ApiError(400, 'VALIDATION_ERROR', `Unsupported source type: ${sourceType}`);
  }

  return adapter;
}
