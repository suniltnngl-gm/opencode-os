import { bootstrapWorkspace } from "../bootstrap/workspace";

const workingDir = process.argv[2] ?? process.cwd();

const result = bootstrapWorkspace(workingDir);

console.log(JSON.stringify(result, null, 2));

if (result.changed) {
  console.log("Bootstrap completed: changes were applied.");
} else {
  console.log("Bootstrap completed: no changes required (idempotent).");
}
