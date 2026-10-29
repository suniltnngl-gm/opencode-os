import * as fs from "node:fs";
import * as path from "node:path";

export interface EnvironmentCheck {
  name: string;
  status: "pass" | "warn" | "fail" | "skip";
  evidence: string;
}

export interface WorkspaceManifest {
  version: "0.1";
  bootstrapDate: string;
  directories: string[];
  checks: EnvironmentCheck[];
}

export interface BootstrapResult {
  changed: boolean;
  manifest: WorkspaceManifest;
}

const DEFAULT_DIRS = [".ai", ".ai/workspace", ".ai/health"];
const WORKSPACE_MANIFEST_FILE = ".ai/workspace.json";
const HEALTH_REPORT_FILE = ".ai/health/health.json";

/**
 * Deterministic, idempotent workspace initializer.
 *
 * Invariants:
 * - Creates missing .ai/ directories; never deletes unrelated files.
 * - Writes config/health reports only when absent.
 * - Never overwrites existing user memory or provider settings.
 * - Running twice produces no unintended changes (idempotent).
 * - Health reports record actual environment checks and outcomes.
 * - workingDir is explicit and testable.
 */
export function bootstrapWorkspace(workingDir: string): BootstrapResult {
  const aiDir = path.join(workingDir, ".ai");
  let changed = false;

  // 1. Create missing directories only — never delete or overwrite user data.
  for (const dir of DEFAULT_DIRS) {
    const fullPath = path.join(workingDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      changed = true;
    }
  }

  // 2. Load existing manifest or create new one.
  const manifestPath = path.join(workingDir, WORKSPACE_MANIFEST_FILE);
  let manifest: WorkspaceManifest;

  if (fs.existsSync(manifestPath)) {
    // Preserve existing manifest — never overwrite user settings.
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } else {
    const checks = runEnvironmentChecks(workingDir, aiDir);
    manifest = {
      version: "0.1",
      bootstrapDate: new Date().toISOString(),
      directories: DEFAULT_DIRS,
      checks,
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    changed = true;
  }

  // 3. Generate health report only when absent.
  const healthPath = path.join(workingDir, HEALTH_REPORT_FILE);
  if (!fs.existsSync(healthPath)) {
    const healthReport = {
      version: "0.1",
      generatedAt: new Date().toISOString(),
      checks: manifest.checks,
    };
    fs.writeFileSync(healthPath, JSON.stringify(healthReport, null, 2));
    changed = true;
  }

  return { changed, manifest };
}

function runEnvironmentChecks(
  workingDir: string,
  aiDir: string
): EnvironmentCheck[] {
  return [checkNodeVersion(), checkWorkspaceRoot(workingDir), checkAiDirectory(aiDir)];
}

function checkNodeVersion(): EnvironmentCheck {
  const current = process.version;
  const major = parseInt(current.slice(1).split(".")[0], 10);
  const meetsMinimum = major >= 22;
  return {
    name: "node-version",
    status: meetsMinimum ? "pass" : "fail",
    evidence: `Node ${current} (minimum >= 22)`,
  };
}

function checkWorkspaceRoot(workingDir: string): EnvironmentCheck {
  const exists = fs.existsSync(workingDir);
  return {
    name: "workspace-root",
    status: exists ? "pass" : "fail",
    evidence: `Path ${workingDir} exists: ${exists}`,
  };
}

function checkAiDirectory(aiDir: string): EnvironmentCheck {
  const exists = fs.existsSync(aiDir);
  return {
    name: "ai-directory",
    status: exists ? "pass" : "fail",
    evidence: `.ai/ directory exists: ${exists}`,
  };
}