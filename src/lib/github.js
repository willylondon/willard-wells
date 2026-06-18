import { redactSecrets } from "./security.js";

function githubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

export function severityToLabel(severity) {
  switch (severity) {
    case "critical":
      return "severity:critical";
    case "high":
      return "severity:high";
    case "medium":
      return "severity:medium";
    case "low":
      return "severity:low";
    default:
      return "severity:info";
  }
}

export function buildIssuePayload(finding, repo) {
  return {
    title: `[Audit] ${finding.title}`,
    body: [
      `Target: ${repo}`,
      `Severity: ${finding.severity}`,
      `Confidence: ${finding.confidence}`,
      `Affected: ${finding.affected}`,
      "",
      `Evidence: ${redactSecrets(finding.evidence)}`,
      `Suggested fix: ${finding.suggestedFix}`,
      `Developer task: ${finding.developerTask}`,
      `Auto-fix availability: ${finding.autoFixAvailability}`,
      `Skill used: ${finding.skill}`,
      `Tool used: ${finding.tool}`
    ].join("\n"),
    labels: [severityToLabel(finding.severity), "audit", "triage"]
  };
}

export function buildPullRequestPayload(fixPlan, repo) {
  return {
    title: `[Audit Fix] ${fixPlan.findingId}`,
    body: [
      `Repo: ${repo}`,
      `Finding: ${fixPlan.findingId}`,
      `Classification: ${fixPlan.classification.availability}`,
      "",
      "This PR is generated only for safe, non-destructive fixes.",
      "Rollback plan is included in the audit log."
    ].join("\n"),
    head: `audit/${fixPlan.findingId}`,
    base: "main"
  };
}

export function createGitHubClient({ token, owner, repo }) {
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

  return {
    async createIssue(finding) {
      const payload = buildIssuePayload(finding, `${owner}/${repo}`);
      const response = await fetch(`${baseUrl}/issues`, {
        method: "POST",
        headers: githubHeaders(token),
        body: JSON.stringify(payload)
      });
      return response.json();
    },
    async createPullRequest(fixPlan) {
      const payload = buildPullRequestPayload(fixPlan, `${owner}/${repo}`);
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        method: "POST",
        headers: githubHeaders(token),
        body: JSON.stringify(payload)
      });
      return response.json();
    }
  };
}
