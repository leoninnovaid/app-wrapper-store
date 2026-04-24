import axios, { AxiosInstance } from 'axios';
import { ApiError } from '../errors/api-error';
import { evaluateArtifactVerification } from '../services/artifact-verification';
import { Platform, ReleaseArtifact, SourceMetadata, SourceRelease } from '../types/domain';
import { ArtifactVerificationContext, SourceAdapter, SourceValidationResult, VerifyArtifactResult } from './source-adapter';
import { normalizePublishedAt, parsePublishedAtTimestamp } from '../utils/source-normalization';

interface GitLabProjectRef {
  apiBaseUrl: string;
  projectPath: string;
  encodedProjectPath: string;
  normalizedUrl: string;
}

interface GitLabReleaseAssetLink {
  name: string;
  url: string;
  direct_asset_url?: string;
}

interface GitLabRelease {
  tag_name?: string;
  name?: string;
  description?: string;
  released_at?: string;
  assets?: {
    links?: GitLabReleaseAssetLink[];
  };
}

interface GitLabProject {
  path_with_namespace?: string;
  description?: string;
  web_url?: string;
}

export class GitLabSourceAdapter implements SourceAdapter {
  readonly sourceType = 'gitlab' as const;
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      headers: {
        'User-Agent': 'AppWrapperStore/1.0',
      },
      timeout: 15000,
    });

    const token = process.env.GITLAB_TOKEN;
    if (token) {
      this.client.defaults.headers.common['PRIVATE-TOKEN'] = token;
    }
  }

  async validate(sourceUrl: string): Promise<SourceValidationResult> {
    const ref = this.parseProjectReference(sourceUrl);
    if (!ref) {
      return {
        valid: false,
        sourceType: this.sourceType,
        normalizedUrl: sourceUrl,
        reason: 'URL must point to a GitLab project',
      };
    }

    try {
      await this.client.get<GitLabProject>(`${ref.apiBaseUrl}/projects/${ref.encodedProjectPath}`);
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
        reason: 'Project could not be validated via GitLab API',
      };
    }
  }

  async fetchMetadata(sourceUrl: string): Promise<SourceMetadata> {
    const ref = this.parseProjectReference(sourceUrl);
    if (!ref) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid GitLab project URL', { sourceUrl });
    }

    try {
      const response = await this.client.get<GitLabProject>(`${ref.apiBaseUrl}/projects/${ref.encodedProjectPath}`);
      return {
        title: response.data.path_with_namespace ?? ref.projectPath,
        description: response.data.description ?? '',
        homepage: response.data.web_url ?? ref.normalizedUrl,
      };
    } catch (error) {
      throw new ApiError(502, 'NETWORK_ERROR', 'Failed to fetch metadata from GitLab', {
        sourceUrl: ref.normalizedUrl,
        error: error instanceof Error ? error.message : 'unknown',
      });
    }
  }

  async listReleases(sourceUrl: string): Promise<SourceRelease[]> {
    const ref = this.parseProjectReference(sourceUrl);
    if (!ref) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid GitLab project URL', { sourceUrl });
    }

    try {
      const response = await this.client.get<GitLabRelease[]>(
        `${ref.apiBaseUrl}/projects/${ref.encodedProjectPath}/releases?per_page=20`,
      );

      const releases = response.data.map((release) => {
        const tag = release.tag_name || release.name || 'unknown';
        const version = release.tag_name || release.name || 'unknown';
        const links = release.assets?.links ?? [];

        return {
          version,
          tag,
          publishedAt: normalizePublishedAt(release.released_at),
          notes: release.description,
          artifacts: links.map((link) => this.mapArtifact(link)),
        };
      });

      return releases.sort((a, b) => parsePublishedAtTimestamp(b.publishedAt) - parsePublishedAtTimestamp(a.publishedAt));
    } catch (error) {
      throw new ApiError(502, 'NETWORK_ERROR', 'Failed to fetch releases from GitLab', {
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

  private parseProjectReference(sourceUrl: string): GitLabProjectRef | null {
    let normalized = sourceUrl.trim();
    if (!normalized) {
      return null;
    }

    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }

    try {
      const parsed = new URL(normalized);
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length < 2) {
        return null;
      }

      const projectPath = parts.join('/').replace(/\.git$/i, '');
      const normalizedUrl = `${parsed.protocol}//${parsed.host}/${projectPath}`;
      return {
        apiBaseUrl: `${parsed.protocol}//${parsed.host}/api/v4`,
        projectPath,
        encodedProjectPath: encodeURIComponent(projectPath),
        normalizedUrl,
      };
    } catch {
      return null;
    }
  }

  private mapArtifact(link: GitLabReleaseAssetLink): ReleaseArtifact {
    const resolvedUrl = link.direct_asset_url ? link.direct_asset_url : link.url;
    const lower = (link.name || resolvedUrl).toLowerCase();

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

    return {
      name: link.name || resolvedUrl,
      type,
      platform,
      url: resolvedUrl,
      size: 0,
      verificationStatus: 'unverified',
      reason: 'No checksum provided by source',
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
