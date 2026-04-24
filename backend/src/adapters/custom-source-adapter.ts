import axios, { AxiosInstance } from 'axios';
import { ApiError } from '../errors/api-error';
import { evaluateArtifactVerification } from '../services/artifact-verification';
import { Platform, ReleaseArtifact, SourceMetadata, SourceRelease } from '../types/domain';
import { ArtifactVerificationContext, SourceAdapter, SourceValidationResult, VerifyArtifactResult } from './source-adapter';
import { normalizePublishedAt, parseChecksumMetadata, parsePublishedAtTimestamp } from '../utils/source-normalization';

interface CustomManifestArtifact {
  name: string;
  type?: ReleaseArtifact['type'];
  platform?: ReleaseArtifact['platform'];
  url: string;
  size?: number;
  checksum?: string;
  integrity?: {
    algorithm?: string;
    value: string;
  };
}

interface CustomManifestRelease {
  version: string;
  tag?: string;
  publishedAt: string;
  notes?: string;
  artifacts: CustomManifestArtifact[];
}

interface CustomManifest {
  title?: string;
  owner?: string;
  description?: string;
  homepage?: string;
  releases: CustomManifestRelease[];
}

export class CustomSourceAdapter implements SourceAdapter {
  readonly sourceType = 'custom' as const;
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 15000,
      headers: {
        'User-Agent': 'AppWrapperStore/1.0',
      },
    });
  }

  async validate(sourceUrl: string): Promise<SourceValidationResult> {
    const normalizedUrl = this.normalizeUrl(sourceUrl);

    try {
      const manifest = await this.fetchManifest(normalizedUrl);
      if (!Array.isArray(manifest.releases)) {
        return {
          valid: false,
          sourceType: this.sourceType,
          normalizedUrl,
          reason: 'Manifest must include a releases array',
        };
      }

      return {
        valid: true,
        sourceType: this.sourceType,
        normalizedUrl,
      };
    } catch {
      return {
        valid: false,
        sourceType: this.sourceType,
        normalizedUrl,
        reason: 'Custom manifest could not be fetched or parsed',
      };
    }
  }

  async fetchMetadata(sourceUrl: string): Promise<SourceMetadata> {
    const normalizedUrl = this.normalizeUrl(sourceUrl);
    const manifest = await this.fetchManifest(normalizedUrl);

    return {
      title: manifest.title || 'Custom Source',
      owner: manifest.owner,
      description: manifest.description || 'Custom manifest source',
      homepage: manifest.homepage || normalizedUrl,
    };
  }

  async listReleases(sourceUrl: string): Promise<SourceRelease[]> {
    const normalizedUrl = this.normalizeUrl(sourceUrl);
    const manifest = await this.fetchManifest(normalizedUrl);

    if (!Array.isArray(manifest.releases)) {
      return [];
    }

    const releases = manifest.releases
      .filter((release) => release.version && Array.isArray(release.artifacts))
      .map((release) => this.mapRelease(release))
      .sort((a, b) => parsePublishedAtTimestamp(b.publishedAt) - parsePublishedAtTimestamp(a.publishedAt));

    return releases;
  }

  pickInstallableArtifact(releases: SourceRelease[], platform: Platform): ReleaseArtifact | null {
    for (const release of releases) {
      const platformArtifacts = release.artifacts.filter((artifact) => artifact.platform === platform || artifact.platform === 'any');
      const prioritized = this.prioritizeArtifacts(platformArtifacts, platform);
      if (prioritized.length > 0) {
        return prioritized[0];
      }
    }

    return null;
  }

  async verifyArtifact(
    release: SourceRelease,
    artifact: ReleaseArtifact,
    context: ArtifactVerificationContext,
  ): Promise<VerifyArtifactResult> {
    return evaluateArtifactVerification(release, artifact, context);
  }

  private normalizeUrl(sourceUrl: string): string {
    let normalized = sourceUrl.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }

    return new URL(normalized).toString();
  }

  private async fetchManifest(sourceUrl: string): Promise<CustomManifest> {
    try {
      const response = await this.client.get<CustomManifest>(sourceUrl);
      return response.data;
    } catch (error) {
      throw new ApiError(502, 'NETWORK_ERROR', 'Failed to fetch custom source manifest', {
        sourceUrl,
        error: error instanceof Error ? error.message : 'unknown',
      });
    }
  }

  private mapRelease(release: CustomManifestRelease): SourceRelease {
    const tag = release.tag || release.version;
    const publishedAt = normalizePublishedAt(release.publishedAt);
    const artifacts = release.artifacts
      .filter((artifact) => artifact.name && artifact.url)
      .map((artifact) => this.mapArtifact(artifact));

    return {
      version: release.version,
      tag,
      publishedAt,
      notes: release.notes,
      artifacts,
    };
  }

  private mapArtifact(artifact: CustomManifestArtifact): ReleaseArtifact {
    const checksumMetadata = parseChecksumMetadata(
      artifact.integrity?.value ?? artifact.checksum,
      artifact.integrity?.algorithm,
      'custom-manifest',
    );
    const inferredType = artifact.type || this.inferTypeFromName(artifact.name);
    const inferredPlatform = artifact.platform || this.inferPlatform(inferredType);

    return {
      name: artifact.name,
      type: inferredType,
      platform: inferredPlatform,
      url: artifact.url,
      size: artifact.size ?? 0,
      checksum: checksumMetadata.checksum,
      integrity: checksumMetadata.integrity,
      verificationStatus: 'unverified',
      reason: checksumMetadata.checksum ? undefined : 'No valid checksum provided by source',
    };
  }

  private inferTypeFromName(name: string): ReleaseArtifact['type'] {
    const lower = name.toLowerCase();
    if (lower.endsWith('.apk')) {
      return 'apk';
    }

    if (lower.endsWith('.aab')) {
      return 'aab';
    }

    if (lower.endsWith('.ipa')) {
      return 'ipa';
    }

    return 'other';
  }

  private inferPlatform(type: ReleaseArtifact['type']): ReleaseArtifact['platform'] {
    if (type === 'apk' || type === 'aab') {
      return 'android';
    }

    if (type === 'ipa') {
      return 'ios';
    }

    return 'any';
  }

  private prioritizeArtifacts(artifacts: ReleaseArtifact[], platform: Platform): ReleaseArtifact[] {
    const priority = platform === 'android' ? ['apk', 'aab', 'other'] : ['ipa', 'other'];

    return [...artifacts].sort((a, b) => {
      const aPriority = priority.indexOf(a.type);
      const bPriority = priority.indexOf(b.type);
      return aPriority - bPriority;
    });
  }
}
