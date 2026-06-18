import { skillRegistry } from "../src/lib/skill-registry.js";

const allowedStatuses = new Set(["proposed", "testing", "approved", "failed", "deprecated", "blocked"]);
const invalid = skillRegistry.filter((skill) => !allowedStatuses.has(skill.status));

if (invalid.length) {
  console.error(JSON.stringify({ ok: false, invalid }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, skills: skillRegistry.length }, null, 2));
