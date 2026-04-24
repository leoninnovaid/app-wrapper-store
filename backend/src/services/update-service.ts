import { AppConfig, AppSource, Platform, ReleaseArtifact, SourceRelease, UpdateCheckResult } from '../types/domain';
import { getSourceAdapter } from './source-registry';
import { parsePublishedAtTimestamp } from '../utils/source-normalization';

interface Candidate {
  source: AppSource;
  release: SourceRelease;
  artifact: ReleaseArtifact;
}

function selectNewestCandidate(candidates: Candidate[]): Candidate {
  const sorted = [...candidates].sort(
    (a, b) => parsePublishedAtTimestamp(b.release.publishedAt) - parsePublishedAtTimestamp(a.release.publishedAt),
  );
  return sorted[0];
}

export async function checkForUpdates(app: AppConfig, sources: AppSource[], platform: Platform): Promise<UpdateCheckResult> {
  const checkedAt = new Date().toISOString();
  const appId = app.id;
  const packaging = app.features?.packaging;
  const verificationContext = {
    platform,
    distribution: packaging?.distribution,
    preferredArtifact: packaging?.preferredArtifact,
  };

  if (sources.length === 0) {
    return {
      appId,
      status: 'blocked',
      checkedAt,
      reason: 'No app source configured',
    };
  }

  const candidates: Candidate[] = [];
  const blockedReasons: string[] = [];

  for (const source of sources) {
    const adapter = getSourceAdapter(source.sourceType);
    const releases = (await adapter.listReleases(source.sourceUrl)).sort(
      (a, b) => parsePublishedAtTimestamp(b.publishedAt) - parsePublishedAtTimestamp(a.publishedAt),
    );

    if (releases.length === 0) {
      blockedReasons.push(`${source.sourceType}: no releases found`);
      continue;
    }

    let selectedRelease: SourceRelease | null = null;
    let artifact: ReleaseArtifact | null = null;
    const sourceBlockedReasons: string[] = [];

    for (const release of releases) {
      let releaseArtifacts = [...release.artifacts];

      while (releaseArtifacts.length > 0) {
        const candidate = adapter.pickInstallableArtifact([{ ...release, artifacts: releaseArtifacts }], platform);
        if (!candidate) {
          break;
        }

        const verification = await adapter.verifyArtifact(release, candidate, verificationContext);
        if (verification.status === 'blocked') {
          sourceBlockedReasons.push(`${source.sourceType}: ${verification.reason ?? 'artifact verification failed'}`);
          releaseArtifacts = releaseArtifacts.filter((artifactOption) => artifactOption !== candidate);
          continue;
        }

        selectedRelease = release;
        artifact = candidate;
        break;
      }

      if (artifact) {
        break;
      }
    }

    if (!artifact) {
      blockedReasons.push(
        ...(sourceBlockedReasons.length > 0 ? sourceBlockedReasons : [`${source.sourceType}: no ${platform} installable artifact found`]),
      );
      continue;
    }

    candidates.push({
      source,
      release: selectedRelease ?? releases[0],
      artifact,
    });
  }

  if (candidates.length === 0) {
    return {
      appId,
      status: 'blocked',
      checkedAt,
      reason: blockedReasons.join('; '),
    };
  }

  const newest = selectNewestCandidate(candidates);
  return {
    appId,
    status: 'update_available',
    checkedAt,
    sourceType: newest.source.sourceType,
    sourceUrl: newest.source.sourceUrl,
    release: newest.release,
    artifact: newest.artifact,
  };
}
