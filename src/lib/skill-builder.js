import { SkillStatus } from "./types.js";

function safeSkillName(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function buildSkillProposal({ stack, missingCapability, reason, sourceName }) {
  const baseName = safeSkillName(`${sourceName || "new"}-${missingCapability || "skill"}`) || "proposed-skill";
  const scannerCommands = unique([
    "npm run lint",
    "npx playwright test",
    "npx lighthouse",
    "npx @axe-core/cli",
    "npx semgrep --config auto",
    stack?.database?.some((entry) => String(entry).toLowerCase().includes("postgres")) ? "psql -f scripts/audit.sql" : null
  ]);

  const manifest = {
    name: baseName,
    version: "0.1.0",
    description: `Proposed skill for ${missingCapability || "a detected gap"} discovered while auditing ${sourceName || "the target"}.`,
    triggerRules: unique([
      reason || "skill gap",
      ...(stack?.framework ?? []),
      ...(stack?.cms ?? []),
      ...(stack?.hostingProvider ?? [])
    ]),
    supportedFrameworks: unique(stack?.framework ?? ["unknown"]),
    requiredTools: unique([
      "Playwright",
      "Lighthouse",
      "axe-core",
      "Semgrep"
    ]),
    permissions: [
      "read-only scan",
      "sandboxed test execution",
      "approval-gated pull request creation"
    ],
    commands: scannerCommands,
    parsers: [
      "structured JSON parser",
      "HTML parser",
      "diff parser"
    ],
    reportTemplates: [`${baseName}-report`],
    fixTemplates: [
      "safe metadata fix",
      "safe accessibility fix",
      "safe SEO fix"
    ],
    tests: [
      "sample clean repo",
      "sample vulnerable repo",
      "sample broken configuration",
      "false-positive ceiling"
    ],
    status: SkillStatus.Proposed
  };

  return {
    manifest,
    checklist: [
      "Write the skill manifest and parser contract.",
      "Validate commands in a sandboxed worker.",
      "Run the skill against clean, vulnerable, and broken fixtures.",
      "Fail the skill on unsafe permissions, destructive actions, or weak evidence.",
      "Open a pull request with the proposed skill before activation."
    ],
    scannerCommands,
    parserLogic: [
      "Treat tool output as untrusted input.",
      "Parse only documented machine-readable output when available.",
      "Require evidence links for every finding.",
      "Reject the skill if the parser cannot explain its results."
    ],
    fixTemplates: [
      "Patch metadata or markup only when the evidence is sufficient.",
      "Require approval for auth, database, payment, API security, CORS, or major dependency changes."
    ],
    testFixtures: [
      {
        name: "clean-repo",
        expectedFindings: 0,
        maxFalsePositives: 0
      },
      {
        name: "vulnerable-repo",
        expectedFindings: 3,
        maxFalsePositives: 1
      },
      {
        name: "broken-config",
        expectedFindings: 1,
        maxFalsePositives: 1
      }
    ],
    documentation: [
      "Explain the trigger rule, confidence threshold, and approval gate.",
      "List the exact parser assumptions and evidence requirements."
    ],
    sampleReport: {
      executiveSummary: `Proposed skill ${manifest.name} identified a gap in ${sourceName || "the current stack"} coverage.`,
      technicalFindings: [
        {
          title: `Coverage gap: ${missingCapability || "unhandled capability"}`,
          severity: "medium",
          confidence: 0.72,
          evidence: reason || "Detected stack signal had no approved matching skill."
        }
      ]
    }
  };
}
