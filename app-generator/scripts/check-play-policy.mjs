import fs from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const args = {};

  for (let index = 2; index < argv.length; index += 1) {
    const key = argv[index];
    const value = argv[index + 1];

    if (!key?.startsWith('--')) {
      continue;
    }

    args[key.slice(2)] = value;
    index += 1;
  }

  return args;
}

async function readJsonFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

function normalizeDistribution(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

async function main() {
  const args = parseArgs(process.argv);

  if (!args.policy || !args.metadata) {
    console.error('Usage: node scripts/check-play-policy.mjs --policy <path> --metadata <path>');
    process.exit(1);
  }

  const policyPath = path.resolve(process.cwd(), args.policy);
  const metadataPath = path.resolve(process.cwd(), args.metadata);

  const policy = await readJsonFile(policyPath);
  const metadata = await readJsonFile(metadataPath);

  const failures = [];
  const distribution = normalizeDistribution(metadata.distribution);
  const rules = policy.rules ?? {};

  if (distribution === 'play-store') {
    const targetSdkVersion = Number(metadata.targetSdkVersion ?? 0);
    const requiredTargetSdk = Number(rules.requiredTargetSdk ?? 0);

    if (!Number.isFinite(targetSdkVersion) || targetSdkVersion < requiredTargetSdk) {
      failures.push(
        `targetSdkVersion ${targetSdkVersion} is below requiredTargetSdk ${requiredTargetSdk} for Play distribution.`,
      );
    }

    const preferredArtifact = String(metadata.preferredArtifact ?? '').toLowerCase();
    const requiredArtifact = String(rules.playRequiredArtifact ?? 'aab').toLowerCase();

    if (preferredArtifact !== requiredArtifact) {
      failures.push(`preferredArtifact '${preferredArtifact}' must be '${requiredArtifact}' for Play distribution.`);
    }

    if (Boolean(rules.requireSigningReady) && metadata.signingReady !== true) {
      failures.push('signingReady must be true for Play distribution.');
    }
  }

  if (failures.length > 0) {
    console.error('Policy check failed.');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('Policy check passed.');
  console.log(`Policy version: ${policy.version ?? 'unknown'}`);
  console.log(`Metadata appId: ${metadata.appId ?? 'unknown'}`);
}

main().catch((error) => {
  console.error('Policy check crashed.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});