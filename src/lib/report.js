export function createFindingReport({ finding, stack, skill, target }) {
  return {
    executiveSummary: `${finding.title} was detected on ${target}.`,
    technicalFindings: [
      {
        title: finding.title,
        severity: finding.severity,
        confidence: finding.confidence,
        evidence: finding.evidence,
        affected: finding.affected
      }
    ],
    evidence: finding.evidence,
    affected: finding.affected,
    severity: finding.severity,
    confidence: finding.confidence,
    suggestedFix: finding.suggestedFix,
    developerTask: finding.developerTask,
    autoFixAvailability: finding.autoFixAvailability,
    skillUsed: skill?.name ?? "unknown",
    toolUsed: finding.tool,
    references: finding.references,
    beforeAfter: finding.beforeAfter,
    stackSummary: stack
  };
}
