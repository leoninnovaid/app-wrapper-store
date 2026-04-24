import axios, { AxiosInstance } from 'axios';
import { ApiError } from '../errors/api-error';
import { Platform, ReleaseArtifact, SourceMetadata, SourceRelease } from '../types/domain';
import { ArtifactVerificationContext, SourceAdapter, SourceValidationResult, VerifyArtifactResult } from './source-adapter';
import { evaluateArtifactVerification } from '../services/artifact-verification';
import { normalizePublishedAt, parseChecksumMetadata, parsePublishedAtTimestamp } from '../utils/source-normalization';

interface GitHubRepoRef {
  owner: string;
  repo: string;
  normalizedUrl: string;
}

interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
  digest?: string;
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  assets: GitHubAsset[];
}

export class GitHubSourceAdapter implements SourceAdapter {
  readonly sourceType = 'github' as const;
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'AppWrapperStore/1.0',
      },
      timeout: 15000,
    });

    const token = process.env.GITHUB_TOKEN;
    if (token) {
      this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }

  async validate(sourceUrl: string): Promise<SourceValidationResult> {
    const ref = this.parseRepositoryReference(sourceUrl);
    if (!ref) {
      return {
        valid: false,
        sourceType: this.sourceType,
        normalizedUrl: sourceUrl,
        reason: 'URL must point to a GitHub repository',
      };
    }

    try {
      await this.client.get(`/repos/${ref.owner}/${ref.repo}`);
      return {
        valid: true,
        sourceType: this.sourceType,
        normalizedUrl: ref.normalizedUrl,
      };
    } catch {
      return {
        valid: false,
        sourceType: this.sourceType,
        normalizedUrl: ref.normalizedUrl,
        reason: 'Repository could not be validated via GitHub API',
      };
    }
  }

  async fetchMetadata(sourceUrl: string): Promise<SourceMetadata> {
    const ref = this.parseRepositoryReference(sourceUrl);
    if (!ref) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid GitHub repository URL', { sourceUrl });
    }

    try {
      const response = await this.client.get(`/repos/${ref.owner}/${ref.repo}`);
      return {
        title: response.data.full_name,
        owner: response.data.owner?.login,
        description: response.data.description ?? '',
        homepage: response.data.html_url,
      };
    } catch (error) {
      throw new ApiError(502, 'NETWORK_ERROR', 'Failed to fetch metadata from GitHub', {
        sourceUrl: ref.normalizedUrl,
        error: error instanceof Error ? error.message : 'unknown',
      });
    }
  }

  async listReleases(sourceUrl: string): Promise<SourceRelease[]> {
    const ref = this.parseRepositoryReference(sourceUrl);
    if (!ref) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid GitHub repository URL', { sourceUrl });
    }

    try {
      const response = await this.client.get<GitHubRelease[]>(`/repos/${ref.owner}/${ref.repo}/releases?per_page=20`);
      const releases = response.data.map((release) => ({
        version: release.tag_name || release.name || 'unknown',
        tag: release.tag_name || release.name || 'unknown',
        publishedAt: normalizePublishedAt(release.published_at),
        notes: release.body,
        artifacts: release.assets.map((asset) => this.mapArtifact(asset)),
      }));

      return releases.sort((a, b) => parsePublishedAtTimestamp(b.publishedAt) - parsePublishedAtTimestamp(a.publishedAt));
    } catch (error) {
      throw new ApiError(502, 'NETWORK_ERROR', 'Failed to fetch releases from GitHub', {
        sourceUrl: ref.normalizedUrl,
        error: error instanceof Error ? error.message : 'unknown',
      });
    }
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

  private parseRepositoryReference(sourceUrl: string): GitHubRepoRef | null {
    let normalized = sourceUrl.trim();
    if (!normalized) {
      return null;
    }

    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }

    try {
      const parsed = new URL(normalized);
      if (parsed.hostname !== 'github.com') {
        return null;
      }

      const [owner, repo] = parsed.pathname.split('/').filter(Boolean);
      if (!owner || !repo) {
        return null;
      }

      const cleanedRepo = repo.replace(/\.git$/i, '');
      return {
        owner,
        repo: cleanedRepo,
        normalizedUrl: `https://github.com/${owner}/${cleanedRepo}`,
      };
    } catch {
      return null;
    }
  }

  private mapArtifact(asset: GitHubAsset): ReleaseArtifact {
    const lower = asset.name.toLowerCase();

    let type: ReleaseArtifact['type'] = 'other';
    let platform: ReleaseArtifact['platform'] = 'any';

    if (lower.endsWith('.apk')) {
      type = 'apk';
      platform = 'android';
    } else if (lower.endsWith('.aab')) {
      type = 'aab';
      platform = 'android';
    } else if (lower.endsWith('.ipa')) {
      type = 'ipa';
      platform = 'ios';
    }

    const digestMetadata = parseChecksumMetadata(asset.digest, undefined, 'github-release-asset-digest');

    return {
      name: asset.name,
      type,
      platform,
      url: asset.browser_download_url,
      size: asset.size,
      checksum: digestMetadata.checksum,
      integrity: digestMetadata.integrity,
      verificationStatus: 'unverified',
      reason: digestMetadata.checksum ? undefined : 'No valid checksum provided by source',
    };
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
