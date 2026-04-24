import { ReleaseArtifact } from '../types/domain';

const EPOCH_ISO = new Date(0).toISOString();
const CHECKSUM_PATTERN = /^[A-Za-z0-9+/=_-]{6,}$/;

export function normalizePublishedAt(value?: string): string {
  if (typeof value !== 'string') {
    return EPOCH_ISO;
  }

  const parsed = Date.parse(value.trim());
  if (Number.isNaN(parsed)) {
    return EPOCH_ISO;
  }

  return new Date(parsed).toISOString();
}

export function normalizeUnixTimestamp(timestampSeconds?: number): string {
  if (!timestampSeconds || !Number.isFinite(timestampSeconds) || timestampSeconds <= 0) {
    return EPOCH_ISO;
  }

  return new Date(timestampSeconds * 1000).toISOString();
}

export function parsePublishedAtTimestamp(value?: string): number {
  const parsed = Date.parse(normalizePublishedAt(value));
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function parseChecksumMetadata(
  rawValue: string | undefined,
  fallbackAlgorithm: string | undefined,
  source: string,
): { checksum?: string; integrity?: ReleaseArtifact['integrity'] } {
  if (!rawValue) {
    return {};
  }

  const trimmed = rawValue.trim();
  if (!trimmed) {
    return {};
  }

  const prefixed = /^([A-Za-z0-9_-]+):(.*)$/.exec(trimmed);
  const algorithm = prefixed ? prefixed[1].trim().toLowerCase() : fallbackAlgorithm;
  const candidateValue = prefixed ? prefixed[2].trim() : trimmed;
  const normalizedValue = normalizeChecksumValue(candidateValue);

  if (!normalizedValue) {
    return {};
  }

  return {
    checksum: normalizedValue,
    integrity: {
      algorithm,
      value: normalizedValue,
      source,
    },
  };
}

function normalizeChecksumValue(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) {
    return undefined;
  }

  if (!CHECKSUM_PATTERN.test(trimmed)) {
    return undefined;
  }

  return trimmed;
}
