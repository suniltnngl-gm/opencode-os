import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface CheckResult {
  name: string;
  status: 'pass' | 'warn' | 'skip';
  detail: string;
}

function checkGit(root: string): CheckResult {
  const gitDir = join(root, '.git');
  if (existsSync(gitDir)) {
    return { name: 'Git', status: 'pass', detail: 'Git repository initialized' };
  }
  return { name: 'Git', status: 'warn', detail: 'Git not initialized — recovery protection not yet available' };
}

function checkFileHistory(): CheckResult {
  // Per policy determination (2026-10-29): File History recoverability unverified —
  // report WARN or SKIP, never PASS.
  return {
    name: 'File History',
    status: 'warn',
    detail: 'Recoverability unverified — backup protection not yet established',
  };
}

function checkDependencies(root: string): CheckResult {
  const lockfile = join(root, 'package-lock.json');
  const manifest = join(root, 'package.json');

  if (!existsSync(lockfile)) {
    return {
      name: 'Dependencies',
      status: 'warn',
      detail: 'Lockfile not found — dependency state unverified',
    };
  }

  if (!existsSync(manifest)) {
    return {
      name: 'Dependencies',
      status: 'warn',
      detail: 'Lockfile present but package.json is missing — required dependencies cannot be determined',
    };
  }

  let requiredPackages: string[];
  try {
    const packageJson = JSON.parse(readFileSync(manifest, 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      optionalDependencies?: Record<string, string>;
    };
    requiredPackages = [
      ...new Set([
        ...Object.keys(packageJson.dependencies ?? {}),
        ...Object.keys(packageJson.devDependencies ?? {}),
        ...Object.keys(packageJson.optionalDependencies ?? {}),
      ]),
    ];
  } catch {
    return {
      name: 'Dependencies',
      status: 'warn',
      detail: 'package.json is unreadable or invalid — dependency state unverified',
    };
  }

  const missingPackages = requiredPackages.filter(
    (name) => !existsSync(join(root, 'node_modules', ...name.split('/'), 'package.json')),
  );

  if (missingPackages.length > 0) {
    return {
      name: 'Dependencies',
      status: 'warn',
      detail: `Lockfile present but required dependency files are missing: ${missingPackages.join(', ')}`,
    };
  }

  // File presence is not proof that dependencies can be loaded or executed.
  return {
    name: 'Dependencies',
    status: 'warn',
    detail: 'Required dependency files are present; runtime usability has not been verified',
  };
}

export function doctor(root?: string): void {
  const workspaceRoot = root ?? process.cwd();
  const results: CheckResult[] = [checkGit(workspaceRoot), checkFileHistory(), checkDependencies(workspaceRoot)];

  console.log('OpenCode OS v0.1 — Doctor diagnostics');
  console.log('----------------------------------------');
  for (const check of results) {
    const symbol = check.status === 'pass' ? '✓' : check.status === 'warn' ? '⚠' : '–';
    console.log(`${symbol} ${check.name}: ${check.detail}`);
  }
  console.log('----------------------------------------');

  const passed = results.filter((r) => r.status === 'pass').length;
  const warned = results.filter((r) => r.status === 'warn').length;
  const skipped = results.filter((r) => r.status === 'skip').length;
  console.log(`Summary: ${results.length} checks — ${passed} pass, ${warned} warn, ${skipped} skip`);
}
