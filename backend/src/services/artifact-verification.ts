import { ArtifactTrustSignals, DistributionChannel, Platform, ReleaseArtifact, SourceRelease } from '../types/domain';
import { ArtifactVerificationContext, VerifyArtifactResult } from '../adapters/source-adapter';

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function inferSourceMetadataCoherence(release: SourceRelease, artifact: ReleaseArtifact): boolean {
  const artifactName = normalizeToken(artifact.name);
  const tag = normalizeToken(release.tag);
  const version = normalizeToken(release.version);

  if (!artifactName) {
    return false;
  }

  return Boolean((tag && artifactName.includes(tag)) || (version && artifactName.includes(version)));
}

function isInstallableArtifact(artifact: ReleaseArtifact, platform: Platform): boolean {
  if (artifact.platform !== platform && artifact.platform !== 'any') {
    return false;
  }

  if (platform === 'android') {
    return artifact.type === 'apk' || artifact.type === 'aab';
  }

  return artifact.type === 'ipa';
}

function isPolicyCompatible(artifact: ReleaseArtifact, distribution: DistributionChannel | undefined): boolean {
  if (distribution === 'play-store') {
    return artifact.type === 'aab';
  }

  return true;
}

export function buildTrustSignals(
  release: SourceRelease,
  artifact: ReleaseArtifact,
  context: ArtifactVerificationContext,
): ArtifactTrustSignals {
  return {
    installable: isInstallableArtifact(artifact, context.platform),
    checksumPresent: Boolean(artifact.checksum?.trim()),
    sourceMetadataCoherent: inferSourceMetadataCoherence(release, artifact),
    policyCompatible: isPolicyCompatible(artifact, context.distribution),
  };
}

export function evaluateArtifactVerification(
  release: SourceRelease,
  artifact: ReleaseArtifact,
  context: ArtifactVerificationContext,
): VerifyArtifactResult {
  const trustSignals = buildTrustSignals(release, artifact, context);
  artifact.trustSignals = trustSignals;

  const blockingReasons: string[] = [];
  if (!trustSignals.installable) {
    blockingReasons.push(`Artifact type ${artifact.type} is not installable for ${context.platform}`);
  }

  if (!trustSignals.policyCompatible) {
    blockingReasons.push('Artifact does not satisfy distribution policy requirements');
  }

  if (blockingReasons.length > 0) {
    const reason = blockingReasons.join('; ');
    artifact.verificationStatus = 'blocked';
    artifact.reason = reason;
    return { status: 'blocked', reason };
  }

  const nonBlockingReasons: string[] = [];
  if (!trustSignals.checksumPresent) {
    nonBlockingReasons.push('No checksum metadata found on artifact');
  }

  if (!trustSignals.sourceMetadataCoherent) {
    nonBlockingReasons.push('Artifact name does not match release tag/version metadata');
  }

  if (nonBlockingReasons.length > 0) {
    const reason = nonBlockingReasons.join('; ');
    artifact.verificationStatus = 'unverified';
    artifact.reason = reason;
    return { status: 'unverified', reason };
  }

  artifact.verificationStatus = 'verified';
  artifact.reason = undefined;
  return { status: 'verified' };
}
