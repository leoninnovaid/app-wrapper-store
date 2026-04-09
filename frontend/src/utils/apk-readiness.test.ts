import { describe, expect, it } from 'vitest';
import { evaluateApkReadiness } from './apk-readiness';

describe('evaluateApkReadiness', () => {
  it('blocks when required fields for Play distribution are missing', () => {
    const report = evaluateApkReadiness({
      packaging: {
        strategy: 'twa',
        distribution: 'play-store',
        preferredArtifact: 'apk',
        readiness: {
          httpsEnabled: false,
          validWebManifest: false,
          digitalAssetLinksReady: false,
          signingKeyReady: false,
          targetApiCompliant: false,
        },
      },
    });

    expect(report.ready).toBe(false);
    expect(report.missingRequirements.some((item) => item.id === 'play-artifact')).toBe(true);
    expect(report.missingRequirements.some((item) => item.id === 'digital-asset-links')).toBe(true);
  });

  it('is ready for local webview build when required checks are enabled', () => {
    const report = evaluateApkReadiness({
      packaging: {
        strategy: 'webview',
        distribution: 'local-sideload',
        preferredArtifact: 'apk',
        readiness: {
          httpsEnabled: true,
          signingKeyReady: true,
        },
      },
    });

    expect(report.ready).toBe(true);
    expect(report.missingRequirements.filter((item) => item.blocking)).toHaveLength(0);
  });
});