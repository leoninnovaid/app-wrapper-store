import { AppSource, Platform, ReleaseArtifact, SourceRelease, UpdateCheckResult } from '../types/domain';
import { getSourceAdapter } from './source-registry';

interface Candidate {
  source: AppSource;
  release: SourceRelease;
  artifact: ReleaseArtifact;
}

function selectNewestCandidate(candidates: Candidate[]): Candidate {
  const sorted = [...candidates].sort((a, b) => Date.parse(b.release.publishedAt) - Date.parse(a.release.publishedAt));
  return sorted[0];
}

export async function checkForUpdates(appId: string, sources: AppSource[], platform: Platform): Promise<UpdateCheckResult> {
  const checkedAt = new Date().toISOString();

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
    const releases = await adapter.listReleases(source.sourceUrl);

    if (releases.length === 0) {
      blockedReasons.push(`${source.sourceType}: no releases found`);
      continue;
    }

    let selectedRelease: SourceRelease | null = null;
    let artifact: ReleaseArtifact | null = null;

    for (const release of releases) {
      const candidate = adapter.pickInstallableArtifact([release], platform);
      if (candidate) {
        selectedRelease = release;
        artifact = candidate;
        break;
      }
    }

    if (!artifact) {
      blockedReasons.push(`${source.sourceType}: no ${platform} installable artifact found`);
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
