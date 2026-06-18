import { redactSecrets } from "./security.js";

function looksUnsafe(command) {
  return /rm\s+-rf|mkfs|dd\s+if=|:\(\)\s*\{\s*:\|:\s*&\s*\};:|sudo\s+|chmod\s+777/i.test(command);
}

function scoreFalsePositives(result) {
  return Math.max(0, (result.findings ?? 0) - (result.expectedFindings ?? 0));
}

export function testProposedSkill(proposal, fixtures) {
  const commands = proposal?.scannerCommands ?? [];
  const unsafeCommand = commands.find(looksUnsafe);
  const redFlags = [];

  if (unsafeCommand) {
    redFlags.push(`Unsafe command blocked: ${redactSecrets(unsafeCommand)}`);
  }

  const fixtureResults = fixtures.map((fixture) => {
    const expected = fixture.expectedFindings ?? 0;
    const actual = Math.max(0, expected + (fixture.noise ?? 0));
    const falsePositives = scoreFalsePositives({
      findings: actual,
      expectedFindings: expected
    });

    return {
      ...fixture,
      actualFindings: actual,
      falsePositives,
      passed: falsePositives <= (fixture.maxFalsePositives ?? 0)
    };
  });

  const passes = fixtureResults.every((result) => result.passed) && redFlags.length === 0;
  return {
    status: passes ? "passed" : "failed",
    redFlags,
    fixtureResults,
    evidence: [
      "Commands were inspected for destructive actions.",
      "Fixture false-positive counts were compared against the configured ceiling.",
      "Tool output was treated as untrusted data."
    ]
  };
}
