import { useMemo, useState } from 'react';
import { AppConfig, AppSource, UpdateCheckResult, sourceService, updateService } from '../services/api';
import { useAppStore } from '../store/appStore';
import { extractTargetId, UiError } from '../types/errors';
import { toUiError } from '../utils/error-utils';
import InlineError from './InlineError';

interface SourceUpdatePanelProps {
  app: AppConfig;
}

const sourceOptions: Array<{ value: AppSource['sourceType']; label: string }> = [
  { value: 'github', label: 'GitHub' },
  { value: 'gitlab', label: 'GitLab' },
  { value: 'fdroid', label: 'F-Droid' },
  { value: 'custom', label: 'Custom' },
];

const verificationStyles: Record<UpdateCheckResult['status'], string> = {
  blocked: 'border-red-200 bg-red-50 text-red-800',
  no_update: 'border-slate-200 bg-slate-50 text-slate-700',
  update_available: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

function formatDate(value?: string): string {
  if (!value) {
    return 'Unknown';
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? value : new Date(timestamp).toLocaleString();
}

function renderTrustFlag(label: string, value?: boolean) {
  if (value === undefined) {
    return null;
  }

  return (
    <span
      key={label}
      className={`rounded-full px-2 py-1 text-xs font-medium ${value ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}
    >
      {label}: {value ? 'yes' : 'no'}
    </span>
  );
}

export default function SourceUpdatePanel({ app }: SourceUpdatePanelProps) {
  const addSourceToApp = useAppStore((state) => state.addSourceToApp);
  const clearScope = useAppStore((state) => state.clearScope);
  const pushError = useAppStore((state) => state.pushError);
  const setSourceValidation = useAppStore((state) => state.setSourceValidation);
  const setUpdateCheck = useAppStore((state) => state.setUpdateCheck);
  const attachedSources = useAppStore((state) => state.appSources.get(app.id) ?? []);
  const validation = useAppStore((state) => state.sourceValidations.get(app.id));
  const updateResult = useAppStore((state) => state.updateChecks.get(app.id));

  const [sourceType, setSourceType] = useState<AppSource['sourceType']>('github');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const targetMatcher = useMemo(
    () => (error: UiError) => extractTargetId(error.details) === app.id,
    [app.id],
  );

  const handleValidate = async () => {
    clearScope('source-validate');

    try {
      setIsValidating(true);
      const response = await sourceService.validate(sourceType, sourceUrl.trim());
      setSourceValidation(app.id, response.data);
    } catch (error) {
      pushError(
        toUiError(error, {
          scope: 'source-validate',
          fallbackMessage: `Failed to validate source for ${app.name}.`,
          retryable: true,
          details: { targetId: app.id },
        }),
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleAttach = async () => {
    clearScope('source-attach');

    try {
      setIsAttaching(true);
      const response = await sourceService.attachToApp(app.id, sourceType, sourceUrl.trim());
      addSourceToApp(app.id, response.data);
    } catch (error) {
      pushError(
        toUiError(error, {
          scope: 'source-attach',
          fallbackMessage: `Failed to attach source to ${app.name}.`,
          retryable: true,
          details: { targetId: app.id },
        }),
      );
    } finally {
      setIsAttaching(false);
    }
  };

  const handleCheckUpdates = async () => {
    clearScope('update-check');

    try {
      setIsChecking(true);
      const response = await updateService.check(app.id, 'android');
      setUpdateCheck(app.id, response.data);
    } catch (error) {
      pushError(
        toUiError(error, {
          scope: 'update-check',
          fallbackMessage: `Failed to check updates for ${app.name}.`,
          retryable: true,
          details: { targetId: app.id },
        }),
      );
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Source and update workflow</h4>
          <p className="text-xs text-slate-600">Validate a release feed, attach it to this app, then inspect Android update trust state.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[140px_minmax(0,1fr)]">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-600">
          Source type
          <select
            value={sourceType}
            onChange={(event) => setSourceType(event.target.value as AppSource['sourceType'])}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            {sourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-medium uppercase tracking-wide text-slate-600">
          Source URL
          <input
            type="url"
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://github.com/org/repo/releases"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleValidate()}
          disabled={isValidating || sourceUrl.trim().length === 0}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isValidating ? 'Validating...' : 'Validate source'}
        </button>
        <button
          type="button"
          onClick={() => void handleAttach()}
          disabled={isAttaching || sourceUrl.trim().length === 0}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAttaching ? 'Attaching...' : 'Attach to app'}
        </button>
        <button
          type="button"
          onClick={() => void handleCheckUpdates()}
          disabled={isChecking}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Check Android updates'}
        </button>
      </div>

      <InlineError scope="source-validate" matcher={targetMatcher} onRetry={() => void handleValidate()} className="mt-3" />
      <InlineError scope="source-attach" matcher={targetMatcher} onRetry={() => void handleAttach()} className="mt-3" />
      <InlineError scope="update-check" matcher={targetMatcher} onRetry={() => void handleCheckUpdates()} className="mt-3" />

      {validation && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <p className="font-medium">Validated {validation.sourceType} source</p>
          <p className="mt-1 break-all">{validation.sourceUrl}</p>
          <p className="mt-1 text-xs text-emerald-800">
            Releases discovered: {validation.releaseCount}
            {validation.metadata?.title ? ` | ${validation.metadata.title}` : ''}
            {validation.metadata?.owner ? ` | owner: ${validation.metadata.owner}` : ''}
          </p>
        </div>
      )}

      {attachedSources.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Attached sources</p>
          <div className="mt-2 space-y-2">
            {attachedSources.map((source) => (
              <div key={source.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <p className="font-medium text-slate-900">
                  {source.sourceType} source
                  {source.metadata?.title ? ` - ${source.metadata.title}` : ''}
                </p>
                <p className="mt-1 break-all text-xs text-slate-600">{source.sourceUrl}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {updateResult && (
        <div className={`mt-3 rounded-lg border p-3 text-sm ${verificationStyles[updateResult.status]}`}>
          <p className="font-medium">
            {updateResult.status === 'update_available'
              ? 'Update available'
              : updateResult.status === 'blocked'
                ? 'Update check blocked'
                : 'No update available'}
          </p>
          <p className="mt-1 text-xs">Checked: {formatDate(updateResult.checkedAt)}</p>
          {updateResult.reason && <p className="mt-2 text-xs">{updateResult.reason}</p>}
          {updateResult.release && (
            <div className="mt-3 rounded-lg border border-current/15 bg-white/70 p-3 text-slate-800">
              <p className="font-medium">
                {updateResult.release.version} ({updateResult.release.tag})
              </p>
              <p className="mt-1 text-xs">Published: {formatDate(updateResult.release.publishedAt)}</p>
              {updateResult.artifact && (
                <>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">Selected artifact</p>
                  <p className="mt-1 break-all text-sm">
                    {updateResult.artifact.name} - {updateResult.artifact.type} - {updateResult.artifact.verificationStatus}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {renderTrustFlag('Installable', updateResult.artifact.trustSignals?.installable)}
                    {renderTrustFlag('Checksum', updateResult.artifact.trustSignals?.checksumPresent)}
                    {renderTrustFlag('Metadata', updateResult.artifact.trustSignals?.sourceMetadataCoherent)}
                    {renderTrustFlag('Policy', updateResult.artifact.trustSignals?.policyCompatible)}
                  </div>
                  {updateResult.artifact.integrity && (
                    <p className="mt-2 text-xs text-slate-600">
                      Integrity: {updateResult.artifact.integrity.algorithm ?? 'digest'} from {updateResult.artifact.integrity.source}
                    </p>
                  )}
                  {updateResult.artifact.reason && <p className="mt-2 text-xs text-slate-600">{updateResult.artifact.reason}</p>}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
