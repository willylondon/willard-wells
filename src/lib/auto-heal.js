import { redactSecrets } from "./security.js";

const SAFE_FIX_PATTERNS = [
  "metadata",
  "missing alt text",
  "broken internal link",
  "robots.txt",
  "sitemap",
  "security header",
  "dependency patch",
  "lint",
  "formatting",
  "open graph",
  "image optimization"
];

const APPROVAL_REQUIRED_PATTERNS = [
  "authentication",
  "authorization",
  "database",
  "payment",
  "file upload validation",
  "cors",
  "api security",
  "major dependency",
  "middleware"
];

export function classifyFix(finding) {
  const title = String(finding?.title ?? "").toLowerCase();
  const evidence = redactSecrets(String(finding?.evidence ?? ""));
  const safe = SAFE_FIX_PATTERNS.some((pattern) => title.includes(pattern) || evidence.toLowerCase().includes(pattern));
  const approvalRequired = APPROVAL_REQUIRED_PATTERNS.some((pattern) => title.includes(pattern) || evidence.toLowerCase().includes(pattern));

  if (approvalRequired) {
    return {
      availability: "needs-approval",
      reason: "The change affects a protected surface and requires human approval.",
      canOpenPullRequest: false
    };
  }

  if (safe) {
    return {
      availability: "safe",
      reason: "This is a safe, non-destructive fix candidate.",
      canOpenPullRequest: true
    };
  }

  return {
    availability: "not-available",
    reason: "No safe auto-fix template is available.",
    canOpenPullRequest: false
  };
}

export function draftFixPlan(finding) {
  const classification = classifyFix(finding);
  return {
    findingId: finding.id,
    classification,
    changeSet: classification.canOpenPullRequest
      ? [
          "Patch the impacted file or metadata only.",
          "Keep the diff minimal and reviewable.",
          "Do not touch protected auth, payment, database, or API surfaces."
        ]
      : [],
    rollbackPlan: [
      "Revert the proposed patch if sandbox verification fails.",
      "Record the rejection in the memory tables.",
      "Preserve the original evidence for future audits."
    ]
  };
}
