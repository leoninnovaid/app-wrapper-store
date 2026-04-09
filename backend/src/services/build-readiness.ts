import { AppConfig, DistributionChannel, PackagingStrategy, Platform } from '../types/domain';

export interface ReadinessRequirement {
  id: string;
  message: string;
  blocking: boolean;
}

export interface BuildReadinessReport {
  ready: boolean;
  strategy: PackagingStrategy;
  distribution: DistributionChannel;
  preferredArtifact: 'apk' | 'aab';
  missingRequirements: ReadinessRequirement[];
}

function requirement(id: string, message: string, blocking = true): ReadinessRequirement {
  return { id, message, blocking };
}

export function evaluateBuildReadiness(app: AppConfig, platform: Platform): BuildReadinessReport {
  const packaging = app.features?.packaging;
  const strategy: PackagingStrategy = packaging?.strategy ?? 'webview';
  const distribution: DistributionChannel = packaging?.distribution ?? 'local-sideload';
  const preferredArtifact = packaging?.preferredArtifact ?? (distribution === 'play-store' ? 'aab' : 'apk');
  const readiness = packaging?.readiness;

  const missing: ReadinessRequirement[] = [];

  if (platform === 'android') {
    if (!readiness?.httpsEnabled) {
      missing.push(requirement('https-enabled', 'Host your app on HTTPS (TLS) to avoid blocked content and insecure sessions.'));
    }

    if (!readiness?.signingKeyReady) {
      missing.push(requirement('signing-key-ready', 'Prepare release signing keys and keystore for Android artifacts.'));
    }

    if (distribution === 'play-store' && preferredArtifact !== 'aab') {
      missing.push(requirement('play-artifact', 'Use Android App Bundle (.aab) for Google Play release uploads.'));
    }

    if (distribution === 'play-store' && !readiness?.targetApiCompliant) {
      missing.push(requirement('target-api', 'Set target SDK to the current Google Play requirement (Android 15 / API 35 or higher).'));
    }

    if (strategy === 'twa') {
      if (!readiness?.validWebManifest) {
        missing.push(requirement('web-manifest', 'Provide a valid web app manifest for Trusted Web Activity packaging.'));
      }

      if (!readiness?.digitalAssetLinksReady) {
        missing.push(requirement('digital-asset-links', 'Publish and verify Digital Asset Links for the website and Android package.'));
      }
    }

    if ((strategy === 'twa' || strategy === 'capacitor') && !readiness?.serviceWorkerReady) {
      missing.push(
        requirement(
          'service-worker',
          'Enable a production service worker for stable caching/offline behavior on modern Android web runtimes.',
          false,
        ),
      );
    }
  }

  const hasBlockingIssue = missing.some((item) => item.blocking);

  return {
    ready: !hasBlockingIssue,
    strategy,
    distribution,
    preferredArtifact,
    missingRequirements: missing,
  };
}