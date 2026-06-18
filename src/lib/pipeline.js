import { buildSkillProposal } from "./skill-builder.js";
import { getApprovedSkillsForStack, getRegistrySnapshot } from "./skill-registry.js";
import { detectStack } from "./stack-detection.js";
import { memorySnapshot, memoryTables } from "./memory.js";
import { findings, repoProfiles } from "./seed.js";
import { classifyFix, draftFixPlan } from "./auto-heal.js";
import { createFindingReport } from "./report.js";
import { testProposedSkill } from "./sandbox.js";

function buildDetectionForRepo(repo) {
  const dependencies = {};

  if (repo.stack.framework.includes("Next.js")) {
    dependencies.next = "^15.3.3";
    dependencies.react = "^19.0.0";
    dependencies["react-dom"] = "^19.0.0";
  }

  if (repo.stack.framework.includes("Remix")) {
    dependencies["@remix-run/react"] = "^2.0.0";
    dependencies["@remix-run/node"] = "^2.0.0";
    dependencies.react = "^19.0.0";
    dependencies["react-dom"] = "^19.0.0";
  }

  if (repo.stack.framework.includes("Astro")) {
    dependencies.astro = "^5.0.0";
  }

  if (repo.stack.authProvider.includes("Clerk")) {
    dependencies["@clerk/nextjs"] = "^6.0.0";
  }

  if (repo.stack.authProvider.includes("Auth0")) {
    dependencies["@auth0/nextjs-auth0"] = "^4.0.0";
  }

  if (repo.stack.database.some((entry) => entry.includes("Supabase"))) {
    dependencies["@supabase/supabase-js"] = "^2.0.0";
  }

  if (repo.stack.paymentProvider.includes("Stripe")) {
    dependencies.stripe = "^17.0.0";
  }

  return detectStack({
    packageJson: JSON.stringify({ dependencies }, null, 2),
    files: [
      ...(repo.stack.framework.includes("Next.js") ? ["app/page.js", "app/layout.js", "next.config.mjs"] : []),
      ...(repo.stack.framework.includes("Remix") ? ["app/routes/_index.tsx", "remix.config.js", "vite.config.ts"] : []),
      ...(repo.stack.framework.includes("Astro") ? ["src/pages/index.astro", "astro.config.mjs"] : []),
      ...(repo.stack.cms.includes("WordPress") ? ["wp-content/themes", "wp-json"] : []),
      "pnpm-lock.yaml",
      ".github/workflows/audit.yml",
      "supabase/migrations/0001_auditor_memory.sql"
    ],
    headers: {
      ...(repo.stack.hostingProvider.includes("Vercel") ? { "x-vercel-id": "sfo1::abc" } : {}),
      ...(repo.stack.hostingProvider.includes("Netlify") ? { "x-nf-request-id": "01J" } : {}),
      ...(repo.stack.hostingProvider.includes("Cloudflare") ? { "cf-ray": "7ed2d1" } : {}),
      ...(repo.stack.paymentProvider.includes("Stripe") ? { "x-stripe-request-id": "req_123" } : {})
    },
    html: [
      repo.stack.cms.includes("WordPress") ? '<meta name="generator" content="WordPress" />' : "",
      repo.stack.framework.includes("Astro") ? '<meta name="generator" content="Astro" />' : "",
      repo.stack.framework.includes("Next.js") ? '<meta name="generator" content="Next.js" />' : ""
    ]
      .filter(Boolean)
      .join("\n")
  });
}

function buildRepoModel(repo, targetOverride = repo.target) {
  const detection = buildDetectionForRepo(repo);
  const approvedSkills = getApprovedSkillsForStack(detection);
  const activeSkills = approvedSkills.length ? approvedSkills : getRegistrySnapshot().skills.filter((skill) => skill.status === "approved");
  const selectedFindings = findings.filter((finding) => repo.findings.includes(finding.id));
  const reports = selectedFindings.map((finding) =>
    createFindingReport({
      finding,
      stack: detection,
      skill: activeSkills.find((skill) => skill.name === finding.skill) ?? activeSkills[0] ?? null,
      target: targetOverride
    })
  );

  const proposal = buildSkillProposal({
    stack: detection,
    missingCapability: "React Server Components cache auditing",
    reason: "Repeated reports show cache boundary recommendations are weak and an approved skill does not exist yet.",
    sourceName: repo.label
  });

  const sandboxResult = testProposedSkill(proposal, [
    {
      name: "sample-clean-repo",
      expectedFindings: 0,
      maxFalsePositives: 0,
      noise: 0
    },
    {
      name: "sample-vulnerable-repo",
      expectedFindings: 3,
      maxFalsePositives: 1,
      noise: 0
    },
    {
      name: "sample-broken-config",
      expectedFindings: 1,
      maxFalsePositives: 1,
      noise: 0
    }
  ]);

  return {
    repo,
    stack: repo.stack,
    detection,
    scanTarget: targetOverride,
    approvedSkills: activeSkills,
    registry: getRegistrySnapshot(),
    findings: selectedFindings,
    reports,
    proposal,
    sandboxResult,
    memoryTables,
    memorySnapshot,
    autoHealSummary: selectedFindings.map((finding) => ({
      id: finding.id,
      title: finding.title,
      classification: classifyFix(finding),
      fixPlan: draftFixPlan(finding)
    })),
    github: {
      issues: selectedFindings.map((finding) => finding.severity),
      pullRequests: selectedFindings
        .filter((finding) => finding.autoFixAvailability === "safe")
        .map((finding) => finding.id)
    }
  };
}

export function resolveRepoProfileFromUrl(url) {
  const value = String(url ?? "").toLowerCase();

  if (value.includes("shop") || value.includes("commerce")) {
    return repoProfiles.find((repo) => repo.id === "commerce-web") ?? repoProfiles[0];
  }

  if (value.includes("docs") || value.includes("knowledge") || value.includes("help")) {
    return repoProfiles.find((repo) => repo.id === "docs-portal") ?? repoProfiles[0];
  }

  return repoProfiles.find((repo) => repo.id === "northstar-dashboard") ?? repoProfiles[0];
}

export function getDashboardModel(selectedRepoId = "northstar-dashboard") {
  const repoModels = Object.fromEntries(repoProfiles.map((repo) => [repo.id, buildRepoModel(repo)]));
  const current = repoModels[selectedRepoId] ?? repoModels[repoProfiles[0].id];

  return {
    ...current,
    scanTarget: current.repo.target,
    repoModels,
    repoProfiles
  };
}

export function getScanModel(targetUrl) {
  const repo = resolveRepoProfileFromUrl(targetUrl);
  const model = buildRepoModel(repo, String(targetUrl || repo.target));

  return {
    ...model,
    scanTarget: String(targetUrl || repo.target),
    repoModels: Object.fromEntries(repoProfiles.map((entry) => [entry.id, buildRepoModel(entry)])),
    repoProfiles
  };
}
