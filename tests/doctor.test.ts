import { doctor } from '../cli/doctor';
import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

function runDoctorInWorkspace(setup: (root: string) => void): string {
  const root = mkdtempSync(join(tmpdir(), 'opencode-os-doctor-test-'));
  const originalLog = console.log;
  const calls: string[] = [];

  try {
    setup(root);
    console.log = (...args: unknown[]) => calls.push(args.join(' '));
    doctor(root);
    return calls.join('\n');
  } finally {
    console.log = originalLog;
    rmSync(root, { recursive: true, force: true });
  }
}

function writeManifest(root: string, manifest: object): void {
  writeFileSync(join(root, 'package.json'), JSON.stringify(manifest), 'utf8');
}

function writeLockfile(root: string): void {
  writeFileSync(join(root, 'package-lock.json'), JSON.stringify({
    name: 'doctor-test-fixture',
    lockfileVersion: 3,
    packages: {},
  }), 'utf8');
}

describe('cli/doctor', () => {
  it('executes without throwing', () => {
    expect(() => doctor()).not.toThrow();
  });

  it('does not perform repair actions', () => {
    const original = console.log;
    const calls: string[] = [];
    console.log = (...args: unknown[]) => calls.push(args.join(' '));
    try {
      doctor();
      const output = calls.join('\n');
      expect(output).not.toMatch(/repair/i);
    } finally {
      console.log = original;
    }
  });

  it('does not report File History as pass', () => {
    const original = console.log;
    const calls: string[] = [];
    console.log = (...args: unknown[]) => calls.push(args.join(' '));
    try {
      doctor();
      const output = calls.join('\n');
      expect(output).toMatch(/⚠ File History: Recoverability unverified/i);
      expect(output).not.toMatch(/File History:.*verified.*pass/i);
    } finally {
      console.log = original;
    }
  });

  it('warns when package-lock.json is missing', () => {
    const output = runDoctorInWorkspace((root) => {
      writeManifest(root, { name: 'fixture', dependencies: {} });
    });

    expect(output).toMatch(/⚠ Dependencies: Lockfile not found/i);
  });

  it('does not claim dependencies are installed when only package-lock.json exists', () => {
    const output = runDoctorInWorkspace((root) => {
      writeLockfile(root);
    });

    expect(output).toMatch(/⚠ Dependencies:/i);
    expect(output).toMatch(/package\.json is missing/i);
    expect(output).not.toMatch(/✓ Dependencies:/i);
    expect(output).not.toMatch(/dependencies installed/i);
  });

  it('warns when the manifest declares packages that are absent from node_modules', () => {
    const output = runDoctorInWorkspace((root) => {
      writeLockfile(root);
      writeManifest(root, {
        name: 'fixture',
        dependencies: { 'missing-fixture-package': '1.0.0' },
      });
    });

    expect(output).toMatch(/⚠ Dependencies:/i);
    expect(output).toMatch(/required dependency files are missing: missing-fixture-package/i);
  });

  it('does not equate dependency file presence with verified runtime usability', () => {
    const output = runDoctorInWorkspace((root) => {
      writeLockfile(root);
      writeManifest(root, {
        name: 'fixture',
        dependencies: { 'present-fixture-package': '1.0.0' },
      });
      const packageDir = join(root, 'node_modules', 'present-fixture-package');
      mkdirSync(packageDir, { recursive: true });
      writeFileSync(join(packageDir, 'package.json'), JSON.stringify({
        name: 'present-fixture-package',
        version: '1.0.0',
      }), 'utf8');
    });

    expect(output).toMatch(/⚠ Dependencies:/i);
    expect(output).toMatch(/runtime usability has not been verified/i);
    expect(output).not.toMatch(/dependencies installed/i);
  });
});
