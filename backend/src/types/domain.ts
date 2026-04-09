export type Platform = 'android' | 'ios';
export type BuildStatus = 'pending' | 'building' | 'completed' | 'failed';
export type SourceType = 'github' | 'fdroid' | 'gitlab' | 'custom';
export type VerificationStatus = 'verified' | 'unverified' | 'blocked';
export type PackagingStrategy = 'webview' | 'twa' | 'capacitor' | 'cordova';
export type DistributionChannel = 'local-sideload' | 'play-store';
export type AndroidArtifactType = 'apk' | 'aab';

export interface ApkReadinessChecklist {
  httpsEnabled?: boolean;
  validWebManifest?: boolean;
  serviceWorkerReady?: boolean;
  digitalAssetLinksReady?: boolean;
  signingKeyReady?: boolean;
  targetApiCompliant?: boolean;
}

export interface PackagingConfig {
  strategy?: PackagingStrategy;
  distribution?: DistributionChannel;
  preferredArtifact?: AndroidArtifactType;
  readiness?: ApkReadinessChecklist;
}

export interface AppConfig {
  id: string;
  name: string;
  description: string;
  url: string;
  icon?: string;
  theme?: {
    primaryColor?: string;
    accentColor?: string;
  };
  features?: {
    enablePushNotifications?: boolean;
    enableOfflineMode?: boolean;
    enableNativeSharing?: boolean;
    enableDeepLinking?: boolean;
    packaging?: PackagingConfig;
  };
  currentVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Build {
  id: string;
  appId: string;
  status: BuildStatus;
  platform: Platform;
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface BuildLog {
  id: string;
  buildId: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: string;
  createdAt: string;
}

export interface AppSource {
  id: string;
  appId: string;
  sourceType: SourceType;
  sourceUrl: string;
  metadata?: {
    title?: string;
    owner?: string;
    description?: string;
  };
  createdAt: string;
}

export interface ReleaseArtifact {
  name: string;
  type: 'apk' | 'aab' | 'ipa' | 'other';
  platform: Platform | 'any';
  url: string;
  size: number;
  checksum?: string;
  verificationStatus: VerificationStatus;
  reason?: string;
}

export interface SourceRelease {
  version: string;
  tag: string;
  publishedAt: string;
  notes?: string;
  artifacts: ReleaseArtifact[];
}

export interface SourceMetadata {
  title: string;
  owner?: string;
  description?: string;
  homepage?: string;
}

export interface UpdateCheckResult {
  appId: string;
  status: 'update_available' | 'no_update' | 'blocked';
  checkedAt: string;
  sourceType?: SourceType;
  sourceUrl?: string;
  release?: SourceRelease;
  artifact?: ReleaseArtifact;
  reason?: string;
}

export interface NewAppInput {
  name: string;
  description: string;
  url: string;
  icon?: string;
  theme?: AppConfig['theme'];
  features?: AppConfig['features'];
  currentVersion?: string;
}