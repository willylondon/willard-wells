import { approvedSkills, proposedSkills, repoProfiles } from "./seed.js";
import { SkillStatus } from "./types.js";

export const skillRegistry = [...approvedSkills, ...proposedSkills];

function scoreSkillAgainstStack(skill, stack) {
  const haystack = new Set([
    ...stack.framework,
    ...stack.hostingProvider,
    ...stack.cms,
    ...stack.frontendStack,
    ...stack.backendStack,
    ...stack.database,
    ...stack.authProvider,
    ...stack.paymentProvider,
    ...stack.apiStructure,
    ...stack.buildSystem
  ].map((value) => String(value).toLowerCase()));

  const triggerMatches = (skill.triggerRules ?? []).filter((rule) =>
    [...haystack].some((value) => value.includes(String(rule).toLowerCase()))
  ).length;

  const frameworkMatches = (skill.supportedFrameworks ?? []).filter((value) =>
    [...haystack].some((item) => item.includes(String(value).toLowerCase()))
  ).length;

  return triggerMatches * 2 + frameworkMatches * 3;
}

export function getApprovedSkillsForStack(stack) {
  return skillRegistry
    .filter((skill) => skill.status === SkillStatus.Approved)
    .map((skill) => ({
      ...skill,
      score: scoreSkillAgainstStack(skill, stack)
    }))
    .filter((skill) => skill.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function getSkillByName(name) {
  return skillRegistry.find((skill) => skill.name === name) ?? null;
}

export function getSkillRegistryCounts() {
  const counts = {
    approved: 0,
    proposed: 0,
    testing: 0,
    failed: 0,
    deprecated: 0,
    blocked: 0
  };

  for (const skill of skillRegistry) {
    counts[skill.status] = (counts[skill.status] ?? 0) + 1;
  }

  return counts;
}

export function getRegistrySnapshot() {
  return {
    skills: skillRegistry,
    counts: getSkillRegistryCounts(),
    repoProfiles
  };
}
