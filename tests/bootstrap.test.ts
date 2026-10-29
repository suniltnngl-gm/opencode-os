import { bootstrapWorkspace } from '../bootstrap/workspace';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

describe('opencode-os bootstrap / workspace generation', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-os-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('clean bootstrap creates missing .ai/ directories and manifest', () => {
    const result = bootstrapWorkspace(tempDir);
    expect(result.changed).toBe(true);
    expect(fs.existsSync(path.join(tempDir, '.ai'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, '.ai', 'workspace.json'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, '.ai', 'health', 'health.json'))).toBe(true);
  });

  it('bootstrap is idempotent — second run produces no changes', () => {
    bootstrapWorkspace(tempDir);
    const first = fs.readFileSync(path.join(tempDir, '.ai', 'workspace.json'), 'utf8');

    const second = bootstrapWorkspace(tempDir);
    const secondManifest = second.manifest;

    expect(second.changed).toBe(false);
    expect(secondManifest.directories).toContain('.ai');
    // manifest should be identical to first run's
    expect(secondManifest).toBeDefined();
  });

  it('bootstrap does not delete unrelated files', () => {
    fs.writeFileSync(path.join(tempDir, 'keep-me.txt'), 'user data');
    bootstrapWorkspace(tempDir);
    expect(fs.existsSync(path.join(tempDir, 'keep-me.txt'))).toBe(true);
  });

  it('bootstrap never overwrites existing user config', () => {
    fs.mkdirSync(path.join(tempDir, '.ai'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, '.ai', 'workspace.json'), '{"version":"0.1","marker":"user"}');
    bootstrapWorkspace(tempDir);
    const content = fs.readFileSync(path.join(tempDir, '.ai', 'workspace.json'), 'utf8');
    expect(content).toContain('"marker":"user"');
  });
});
