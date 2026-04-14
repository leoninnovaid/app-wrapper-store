import {
  AndroidArtifactType,
  DistributionChannel,
  Platform,
  ReleaseArtifact,
  SourceMetadata,
  SourceRelease,
  SourceType,
  VerificationStatus,
} from '../types/domain';

export interface SourceValidationResult {
  valid: boolean;
  sourceType: SourceType;
  normalizedUrl: string;
  reason?: string;
}

export interface VerifyArtifactResult {
  status: VerificationStatus;
  reason?: string;
}

export interface ArtifactVerificationContext {
  platform: Platform;
  distribution?: DistributionChannel;
  preferredArtifact?: AndroidArtifactType;
}

export interface SourceAdapter {
  readonly sourceType: SourceType;
  validate(sourceUrl: string): Promise<SourceValidationResult>;
  fetchMetadata(sourceUrl: string): Promise<SourceMetadata>;
  listReleases(sourceUrl: string): Promise<SourceRelease[]>;
  pickInstallableArtifact(releases: SourceRelease[], platform: Platform): ReleaseArtifact | null;
  verifyArtifact(release: SourceRelease, artifact: ReleaseArtifact, context: ArtifactVerificationContext): Promise<VerifyArtifactResult>;
}
