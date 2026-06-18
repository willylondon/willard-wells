export const memoryTables = [
  {
    name: "repo_profile",
    purpose: "Tracks stack fingerprints and last-seen repository characteristics."
  },
  {
    name: "previous_findings",
    purpose: "Records findings with evidence, severity, confidence, and outcome."
  },
  {
    name: "accepted_fixes",
    purpose: "Stores fixes that shipped successfully and were accepted."
  },
  {
    name: "rejected_fixes",
    purpose: "Stores fixes that were rejected, with reasons and rollback notes."
  },
  {
    name: "known_false_positives",
    purpose: "Captures recurring false positives so future scans can suppress them."
  },
  {
    name: "approved_skills",
    purpose: "Approved skill registry with versions and supported frameworks."
  },
  {
    name: "proposed_skills",
    purpose: "Proposed skills awaiting sandbox validation and PR approval."
  },
  {
    name: "skill_test_results",
    purpose: "Sandbox test outcomes for proposed skills."
  },
  {
    name: "scanner_versions",
    purpose: "Version history for scanners, parsers, and reporting templates."
  },
  {
    name: "tool_failures",
    purpose: "Tracks parser failures, command failures, and unexpected tool output."
  }
];

export const memorySnapshot = {
  repoProfiles: 3,
  previousFindings: 9,
  acceptedFixes: 5,
  rejectedFixes: 2,
  knownFalsePositives: 4,
  approvedSkills: 5,
  proposedSkills: 1,
  skillTestResults: 3,
  scannerVersions: 7,
  toolFailures: 2
};
