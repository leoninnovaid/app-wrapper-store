import { PackagingStrategy } from '../services/api';

interface StrategyCard {
  id: PackagingStrategy;
  title: string;
  output: 'APK/AAB' | 'APK only' | 'AAB preferred';
  summary: string;
  bestFor: string;
  requirements: string[];
  references: Array<{ label: string; href: string }>;
}

const strategies: StrategyCard[] = [
  {
    id: 'webview',
    title: 'Native WebView Wrapper',
    output: 'APK/AAB',
    summary: 'Fastest route: package the website inside an Android WebView shell.',
    bestFor: 'MVPs, internal apps, and controlled website domains.',
    requirements: [
      'HTTPS endpoint and domain allowlist',
      'WebView hardening (no unsafe JS bridge exposure)',
      'Release signing keys for install/update continuity',
    ],
    references: [
      { label: 'Android WebView docs', href: 'https://developer.android.com/reference/android/webkit/WebView' },
      { label: 'Android security best practices', href: 'https://developer.android.com/privacy-and-security/security-best-practices' },
    ],
  },
  {
    id: 'twa',
    title: 'Trusted Web Activity (TWA)',
    output: 'AAB preferred',
    summary: 'Full-screen browser container for PWAs with verified app-to-site ownership.',
    bestFor: 'Production PWAs targeting Play Store distribution.',
    requirements: [
      'Valid web manifest and HTTPS',
      'Digital Asset Links configured both app and website side',
      'Signing key consistency to keep verification valid',
    ],
    references: [
      { label: 'TWA integration guide', href: 'https://developer.chrome.com/docs/android/trusted-web-activity/integration-guide/' },
      { label: 'TWA quick start', href: 'https://developer.chrome.com/docs/android/trusted-web-activity/quick-start' },
    ],
  },
  {
    id: 'capacitor',
    title: 'Capacitor Android Shell',
    output: 'APK/AAB',
    summary: 'Hybrid native shell with plugin system and Android Studio tooling.',
    bestFor: 'Web apps needing moderate native APIs (share, push, deep links).',
    requirements: [
      'Add android platform and sync native project',
      'WebView runtime compatibility (API 24+)',
      'Signed release and target SDK compliance for Play',
    ],
    references: [
      { label: 'Capacitor Android docs', href: 'https://capacitorjs.com/docs/android' },
    ],
  },
  {
    id: 'cordova',
    title: 'Apache Cordova',
    output: 'APK/AAB',
    summary: 'Mature wrapper ecosystem with broad plugin coverage.',
    bestFor: 'Legacy plugin stacks or teams already invested in Cordova.',
    requirements: [
      'Android SDK + Gradle + JDK setup',
      'Environment variables (ANDROID_HOME/JAVA_HOME)',
      'Release signing and target API updates per Play policy',
    ],
    references: [
      { label: 'Cordova Android platform guide', href: 'https://cordova.apache.org/docs/en/latest/guide/platforms/android/' },
    ],
  },
];

export default function PackagingMethodGuide() {
  return (
    <section className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Android Packaging Methods</h2>
        <p className="mt-1 text-sm text-gray-600">
          Choose a strategy first, then satisfy the readiness checklist before triggering a build.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {strategies.map((strategy) => (
          <article key={strategy.id} className="rounded-md border border-gray-200 p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-gray-900">{strategy.title}</h3>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                {strategy.output}
              </span>
            </div>

            <p className="text-sm text-gray-700">{strategy.summary}</p>
            <p className="mt-2 text-xs text-gray-500">Best for: {strategy.bestFor}</p>

            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
              {strategy.requirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>

            <div className="mt-3 flex flex-wrap gap-2">
              {strategy.references.map((reference) => (
                <a
                  key={reference.href}
                  href={reference.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                >
                  {reference.label}
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}