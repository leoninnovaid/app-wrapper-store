import axios, { AxiosInstance } from 'axios';
import { Platform, ReleaseArtifact, SourceMetadata, SourceRelease } from '../types/domain';
import { evaluateArtifactVerification } from '../services/artifact-verification';
import { ArtifactVerificationContext, SourceAdapter, SourceValidationResult, VerifyArtifactResult } from './source-adapter';
import { normalizeUnixTimestamp, parseChecksumMetadata, parsePublishedAtTimestamp } from '../utils/source-normalization';

interface FdroidIndexV1PackageVersion {
  versionName?: string;
  versionCode?: number;
  added?: number;
  apkName?: string;
  hash?: string;
  packageName?: string;
}

interface FdroidIndexV1 {
  repo?: {
    name?: string;
    description?: string;
    address?: string;
  };
  packages?: Record<string, FdroidIndexV1PackageVersion[]> | FdroidIndexV1PackageVersion[];
}

export class FdroidSourceAdapter implements SourceAdapter {
  readonly sourceType = 'fdroid' as const;
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
    const normalizedUrl = this.normalizeBaseUrl(sourceUrl);

    try {
      await this.fetchIndex(normalizedUrl);
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
        reason: 'Unable to read F-Droid index-v1.json from source URL',
      };
    }
  }

  async fetchMetadata(sourceUrl: string): Promise<SourceMetadata> {
    const normalizedUrl = this.normalizeBaseUrl(sourceUrl);
    const index = await this.fetchIndex(normalizedUrl);

    return {
      title: index.repo?.name || 'F-Droid Repository',
      description: index.repo?.description || 'F-Droid package source',
      homepage: index.repo?.address || normalizedUrl,
    };
  }

  async listReleases(sourceUrl: string): Promise<SourceRelease[]> {
    const normalizedUrl = this.normalizeBaseUrl(sourceUrl);
    const index = await this.fetchIndex(normalizedUrl);
    const packageVersions = this.extractPackageVersions(index);

    const releases = packageVersions
      .filter((entry) => Boolean(entry.apkName))
      .map((entry) => this.mapRelease(entry, index, normalizedUrl))
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

  private normalizeBaseUrl(sourceUrl: string): string {
    let normalized = sourceUrl.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }

    const parsed = new URL(normalized);
    parsed.hash = '';
    parsed.search = '';
    parsed.pathname = parsed.pathname.replace(/\/+$/, '');
    return parsed.toString();
  }

  private async fetchIndex(baseUrl: string): Promise<FdroidIndexV1> {
    const directUrl = `${baseUrl}/index-v1.json`;
    const repoUrl = `${baseUrl}/repo/index-v1.json`;

    try {
      const direct = await this.client.get<FdroidIndexV1>(directUrl);
      return direct.data;
    } catch {
      const fallback = await this.client.get<FdroidIndexV1>(repoUrl);
      return fallback.data;
    }
  }

  private extractPackageVersions(index: FdroidIndexV1): FdroidIndexV1PackageVersion[] {
    if (!index.packages) {
      return [];
    }

    if (Array.isArray(index.packages)) {
      return index.packages;
    }

    return Object.values(index.packages).flatMap((versions) => versions);
  }

  private mapRelease(version: FdroidIndexV1PackageVersion, index: FdroidIndexV1, baseUrl: string): SourceRelease {
    const versionName = version.versionName || `version-${version.versionCode ?? 'unknown'}`;
    const tag = versionName;
    const publishedAt = normalizeUnixTimestamp(version.added);
    const artifactUrl = this.resolveArtifactUrl(baseUrl, index, version.apkName || '');
    const checksumMetadata = parseChecksumMetadata(version.hash, 'sha256', 'fdroid-index-v1-hash');

    return {
      version: versionName,
      tag,
      publishedAt,
      artifacts: [
        {
          name: version.apkName || `${versionName}.apk`,
          type: 'apk',
          platform: 'android',
          url: artifactUrl,
          size: 0,
          checksum: checksumMetadata.checksum,
          integrity: checksumMetadata.integrity,
          verificationStatus: 'unverified',
          reason: checksumMetadata.checksum ? undefined : 'No valid checksum provided by source',
        },
      ],
    };
  }

  private resolveArtifactUrl(baseUrl: string, index: FdroidIndexV1, apkName: string): string {
    const repoAddress = index.repo?.address?.replace(/\/+$/, '');
    if (repoAddress) {
      return `${repoAddress}/${apkName}`;
    }

    if (baseUrl.endsWith('/repo')) {
      return `${baseUrl}/${apkName}`;
    }

    return `${baseUrl}/repo/${apkName}`;
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
