import { AppConfig, DistributionChannel, PackagingStrategy } from '../services/api';

export interface ReadinessRequirement {
  id: string;
  label: string;
  blocking: boolean;
}

export interface ApkReadinessReport {
  strategy: PackagingStrategy;
  distribution: DistributionChannel;
  preferredArtifact: 'apk' | 'aab';
  ready: boolean;
  missingRequirements: ReadinessRequirement[];
}

function item(id: string, label: string, blocking = true): ReadinessRequirement {
  return { id, label, blocking };
}

export function evaluateApkReadiness(features: AppConfig['features'] | undefined): ApkReadinessReport {
  const packaging = features?.packaging;
  const readiness = packaging?.readiness;

  const strategy: PackagingStrategy = packaging?.strategy ?? 'webview';
  const distribution: DistributionChannel = packaging?.distribution ?? 'local-sideload';
  const preferredArtifact = packaging?.preferredArtifact ?? (distribution === 'play-store' ? 'aab' : 'apk');

  const missingRequirements: ReadinessRequirement[] = [];

  if (!readiness?.httpsEnabled) {
    missingRequirements.push(item('https-enabled', 'Serve the site over HTTPS.'));
  }

  if (!readiness?.signingKeyReady) {
    missingRequirements.push(item('signing-key-ready', 'Configure release signing keys/keystore.'));
  }

  if (distribution === 'play-store' && preferredArtifact !== 'aab') {
    missingRequirements.push(item('play-artifact', 'Use Android App Bundle (.aab) for Play Store uploads.'));
  }

  if (distribution === 'play-store' && !readiness?.targetApiCompliant) {
    missingRequirements.push(item('target-api', 'Target current Google Play API level requirement (API 35+).'));
  }

  if (strategy === 'twa') {
    if (!readiness?.validWebManifest) {
      missingRequirements.push(item('web-manifest', 'Provide a valid web app manifest.'));
    }

    if (!readiness?.digitalAssetLinksReady) {
      missingRequirements.push(item('digital-asset-links', 'Publish and verify .well-known/assetlinks.json for app/domain binding.'));
    }
  }

  if ((strategy === 'twa' || strategy === 'capacitor') && !readiness?.serviceWorkerReady) {
    missingRequirements.push(
      item(
        'service-worker',
        'Set up a production service worker for stable caching/offline behavior.',
        false,
      ),
    );
  }

  const ready = !missingRequirements.some((requirement) => requirement.blocking);

  return {
    strategy,
    distribution,
    preferredArtifact,
    ready,
    missingRequirements,
  };
}