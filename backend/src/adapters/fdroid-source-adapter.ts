import { Platform, ReleaseArtifact, SourceMetadata, SourceRelease } from '../types/domain';
import { SourceAdapter, SourceValidationResult, VerifyArtifactResult } from './source-adapter';

export class FdroidSourceAdapter implements SourceAdapter {
  readonly sourceType = 'fdroid' as const;

  async validate(sourceUrl: string): Promise<SourceValidationResult> {
    const normalizedUrl = sourceUrl.trim();
    const valid = /f-?droid/i.test(normalizedUrl);

    return {
      valid,
      sourceType: this.sourceType,
      normalizedUrl,
      reason: valid ? undefined : 'URL does not look like an F-Droid source',
    };
  }

  async fetchMetadata(sourceUrl: string): Promise<SourceMetadata> {
    return {
      title: 'F-Droid Source (Scaffold)',
      description: 'F-Droid adapter scaffolded. Full metadata extraction is planned in next sprint.',
      homepage: sourceUrl,
    };
  }

  async listReleases(): Promise<SourceRelease[]> {
    return [];
  }

  pickInstallableArtifact(_releases: SourceRelease[], _platform: Platform): ReleaseArtifact | null {
    return null;
  }

  async verifyArtifact(_artifact: ReleaseArtifact): Promise<VerifyArtifactResult> {
    return {
      status: 'blocked',
      reason: 'F-Droid verification flow is not implemented yet',
    };
  }
}
