import { FindingSeverity, SkillStatus } from "./types.js";

export const repoProfiles = [
  {
    id: "northstar-dashboard",
    label: "northstar-dashboard",
    kind: "GitHub repo",
    target: "github.com/acme/northstar-dashboard",
    stack: {
      framework: ["Next.js", "React"],
      packageManager: ["pnpm"],
      hostingProvider: ["Vercel"],
      cms: ["Sanity"],
      frontendStack: ["Tailwind CSS", "Radix UI"],
      backendStack: ["Next.js Route Handlers", "Node.js"],
      database: ["Supabase/PostgreSQL"],
      authProvider: ["Clerk"],
      paymentProvider: ["Stripe"],
      apiStructure: ["REST", "RSC"],
      buildSystem: ["Next.js", "Turbopack"],
      confidence: 0.96,
      evidence: [
        "package.json includes next, react, react-dom, @clerk/nextjs, @supabase/supabase-js, stripe",
        "next.config.mjs and app router are present",
        "Vercel deployment headers detected"
      ]
    },
    approvedSkills: ["nextjs-site-audit", "clerk-auth-audit", "stripe-payments-audit", "supabase-postgres-audit"],
    proposedSkills: ["rsc-cache-audit"],
    findings: ["finding-1", "finding-2", "finding-3", "finding-4"]
  },
  {
    id: "commerce-web",
    label: "commerce-web",
    kind: "Live site",
    target: "shop.acme.io",
    stack: {
      framework: ["Remix", "React"],
      packageManager: ["npm"],
      hostingProvider: ["Cloudflare"],
      cms: ["Contentful"],
      frontendStack: ["Vanilla Extract", "Headless UI"],
      backendStack: ["Cloudflare Workers"],
      database: ["D1"],
      authProvider: ["Auth0"],
      paymentProvider: ["Stripe"],
      apiStructure: ["GraphQL", "REST"],
      buildSystem: ["Vite"],
      confidence: 0.91,
      evidence: [
        "remix.config.js and vite.config.ts present",
        "workers deploy headers detected",
        "GraphQL endpoint and Stripe checkout routes found"
      ]
    },
    approvedSkills: ["remix-audit", "stripe-payments-audit", "graphql-api-audit"],
    proposedSkills: ["cloudflare-workers-route-audit"],
    findings: ["finding-5", "finding-6", "finding-7"]
  },
  {
    id: "docs-portal",
    label: "docs-portal",
    kind: "Website",
    target: "docs.acme.io",
    stack: {
      framework: ["Astro"],
      packageManager: ["npm"],
      hostingProvider: ["Netlify"],
      cms: ["WordPress"],
      frontendStack: ["Astro Islands", "MDX"],
      backendStack: ["Node.js"],
      database: ["PostgreSQL"],
      authProvider: ["None"],
      paymentProvider: ["None"],
      apiStructure: ["Static"],
      buildSystem: ["Astro"],
      confidence: 0.87,
      evidence: [
        "astro.config.mjs present",
        "WordPress meta generator detected",
        "Netlify headers indicate static hosting"
      ]
    },
    approvedSkills: ["astro-a11y-audit", "wordpress-cms-audit"],
    proposedSkills: ["astro-islands-performance-audit"],
    findings: ["finding-8", "finding-9"]
  }
];

export const findings = [
  {
    id: "finding-1",
    title: "Security headers are incomplete on the product shell",
    severity: FindingSeverity.High,
    confidence: 0.94,
    affected: "/",
    evidence: "Missing `content-security-policy` and `permissions-policy` on the first response.",
    suggestedFix: "Add server header middleware and test the header set in a sandboxed check.",
    developerTask: "Update the edge or server header configuration and verify against a known-good baseline.",
    autoFixAvailability: "safe",
    skill: "nextjs-site-audit",
    tool: "OWASP ZAP + custom header parser",
    references: ["OWASP ASVS 14", "MDN security headers"],
    beforeAfter: "Before: no CSP. After: restrictive CSP with explicit asset allowlist."
  },
  {
    id: "finding-2",
    title: "One marketing image lacks alt text",
    severity: FindingSeverity.Medium,
    confidence: 0.98,
    affected: "/app/home",
    evidence: "Image element uses an empty alt attribute while conveying product meaning.",
    suggestedFix: "Add descriptive alt text and keep it concise enough for assistive technologies.",
    developerTask: "Patch the component props and rerun axe-core.",
    autoFixAvailability: "safe",
    skill: "nextjs-site-audit",
    tool: "axe-core",
    references: ["WCAG 1.1.1", "axe-core rule documentation"],
    beforeAfter: "Before: empty alt. After: descriptive alt that matches the visual."
  },
  {
    id: "finding-3",
    title: "Package lock drift increases risk of accidental major upgrades",
    severity: FindingSeverity.Medium,
    confidence: 0.87,
    affected: "package.json",
    evidence: "Dependabot noise shows major bumps grouped with patch updates.",
    suggestedFix: "Split dependency update strategy so minor/patch updates auto-merge and majors require review.",
    developerTask: "Adjust Renovate/Dependabot policy and pin safe ranges.",
    autoFixAvailability: "needs-approval",
    skill: "dependency-policy-audit",
    tool: "Renovate config parser",
    references: ["Dependabot docs", "SemVer best practices"],
    beforeAfter: "Before: mixed update lanes. After: separate safe and approval-required lanes."
  },
  {
    id: "finding-4",
    title: "GraphQL responses are under-documented",
    severity: FindingSeverity.Low,
    confidence: 0.79,
    affected: "/api/graphql",
    evidence: "Schema introspection is enabled but report artifacts are missing field-level examples.",
    suggestedFix: "Emit a schema snapshot artifact and link it from the report.",
    developerTask: "Add schema export in CI and attach the artifact to pull requests.",
    autoFixAvailability: "safe",
    skill: "graphql-api-audit",
    tool: "custom GraphQL schema parser",
    references: ["GraphQL specification"],
    beforeAfter: "Before: no schema snapshot. After: attached schema artifact and examples."
  },
  {
    id: "finding-5",
    title: "Checkout flow needs stronger client-side validation",
    severity: FindingSeverity.High,
    confidence: 0.91,
    affected: "/checkout",
    evidence: "Form allows impossible states before server validation catches them.",
    suggestedFix: "Add client-side checks for required fields and format constraints.",
    developerTask: "Update form validation and rerun Playwright.",
    autoFixAvailability: "needs-approval",
    skill: "stripe-payments-audit",
    tool: "Playwright + form-state parser",
    references: ["Stripe checkout guidance"],
    beforeAfter: "Before: server-only validation. After: client and server validation aligned."
  },
  {
    id: "finding-6",
    title: "Static asset caching can be tuned for repeat visits",
    severity: FindingSeverity.Low,
    confidence: 0.92,
    affected: "build output",
    evidence: "Long-lived immutable assets are missing cache-control hints.",
    suggestedFix: "Set immutable caching for fingerprinted files and keep HTML un-cached.",
    developerTask: "Adjust CDN or origin headers and confirm in Lighthouse.",
    autoFixAvailability: "safe",
    skill: "remix-audit",
    tool: "Lighthouse",
    references: ["web.dev caching guidance"],
    beforeAfter: "Before: short cache lifetimes. After: immutable fingerprints with explicit HTML freshness."
  },
  {
    id: "finding-7",
    title: "GraphQL resolver response shape is not normalized",
    severity: FindingSeverity.Medium,
    confidence: 0.83,
    affected: "/api/graph",
    evidence: "The API returns partial nested objects with inconsistent naming.",
    suggestedFix: "Normalize response contracts and emit stable schema docs.",
    developerTask: "Introduce a shape validator and update the schema snapshot.",
    autoFixAvailability: "needs-approval",
    skill: "graphql-api-audit",
    tool: "GraphQL AST parser",
    references: ["GraphQL spec"],
    beforeAfter: "Before: partial nested objects. After: normalized response contract."
  },
  {
    id: "finding-8",
    title: "Docs page has a missing sitemap entry",
    severity: FindingSeverity.Medium,
    confidence: 0.96,
    affected: "/docs",
    evidence: "Crawler discovered pages that were not present in sitemap.xml.",
    suggestedFix: "Generate a sitemap and include all canonical docs routes.",
    developerTask: "Add sitemap generation to build and verify with a crawl.",
    autoFixAvailability: "safe",
    skill: "astro-a11y-audit",
    tool: "sitemap parser + crawler",
    references: ["Sitemaps protocol"],
    beforeAfter: "Before: incomplete sitemap. After: canonical docs routes included."
  },
  {
    id: "finding-9",
    title: "Heading hierarchy skips one level in docs navigation",
    severity: FindingSeverity.Low,
    confidence: 0.88,
    affected: "/docs/getting-started",
    evidence: "A visual heading acts like an H2 but is coded as H4.",
    suggestedFix: "Align heading levels with the document hierarchy.",
    developerTask: "Adjust semantic heading tags and rerun accessibility checks.",
    autoFixAvailability: "safe",
    skill: "wordpress-cms-audit",
    tool: "axe-core",
    references: ["WCAG semantics guidance"],
    beforeAfter: "Before: semantic mismatch. After: heading levels match hierarchy."
  }
];

export const approvedSkills = [
  {
    name: "nextjs-site-audit",
    version: "2.4.0",
    description: "Audits Next.js sites for performance, accessibility, and security header issues.",
    triggerRules: ["next.js", "app router", "vercel deployment", "route handlers"],
    supportedFrameworks: ["Next.js", "React"],
    requiredTools: ["Playwright", "Lighthouse", "axe-core", "Semgrep"],
    permissions: ["read-only scan", "approval-gated fix PRs"],
    commands: ["npm run lint", "npx playwright test", "npx lighthouse", "npx @axe-core/cli"],
    parsers: ["HTML parser", "Lighthouse JSON parser", "axe-core JSON parser"],
    reportTemplates: ["nextjs-audit-report"],
    fixTemplates: ["metadata", "security headers", "alt text", "OG tags", "sitemap", "robots"],
    tests: ["sample clean repo", "sample vulnerable repo", "sample broken config"],
    status: SkillStatus.Approved
  },
  {
    name: "supabase-postgres-audit",
    version: "1.3.1",
    description: "Reviews Postgres schema, query shape, and RLS posture for Supabase-backed apps.",
    triggerRules: ["supabase", "postgres", "sql", "rls"],
    supportedFrameworks: ["Supabase", "PostgreSQL"],
    requiredTools: ["SQL parser", "EXPLAIN", "Semgrep"],
    permissions: ["read-only schema inspection", "approval-gated migrations"],
    commands: ["psql -f", "npm run audit:db"],
    parsers: ["SQL AST parser", "plan parser"],
    reportTemplates: ["postgres-audit-report"],
    fixTemplates: ["indexes", "RLS", "schema constraints", "query rewrites"],
    tests: ["clean schema", "vulnerable schema", "broken migration"],
    status: SkillStatus.Approved
  },
  {
    name: "stripe-payments-audit",
    version: "1.1.0",
    description: "Checks Stripe payment and checkout flows for client-side, server-side, and webhooks issues.",
    triggerRules: ["stripe", "checkout", "payment intents", "webhooks"],
    supportedFrameworks: ["Stripe", "Next.js", "React", "Remix"],
    requiredTools: ["Playwright", "Webhook replay parser"],
    permissions: ["read-only scan", "approval-gated payment changes"],
    commands: ["npx playwright test", "npm run audit:payments"],
    parsers: ["network trace parser", "JSON parser"],
    reportTemplates: ["payments-audit-report"],
    fixTemplates: ["validation", "metadata", "webhook retry guidance"],
    tests: ["clean checkout", "failed payment", "webhook signature mismatch"],
    status: SkillStatus.Approved
  },
  {
    name: "wordpress-cms-audit",
    version: "1.0.2",
    description: "Audits WordPress content structure, metadata, crawlability, and accessibility.",
    triggerRules: ["wordpress", "wp-content", "wp-json"],
    supportedFrameworks: ["WordPress", "PHP"],
    requiredTools: ["Crawler", "axe-core", "Sitemap parser"],
    permissions: ["read-only scan", "approval-gated CMS changes"],
    commands: ["npx crawl", "npx @axe-core/cli"],
    parsers: ["DOM parser", "sitemap parser"],
    reportTemplates: ["cms-audit-report"],
    fixTemplates: ["alt text", "sitemap", "robots", "metadata", "heading structure"],
    tests: ["clean CMS", "missing sitemap", "broken canonical"],
    status: SkillStatus.Approved
  },
  {
    name: "graphql-api-audit",
    version: "0.9.8",
    description: "Audits GraphQL schemas, resolver shapes, and exposure controls.",
    triggerRules: ["graphql", "schema", "introspection"],
    supportedFrameworks: ["GraphQL", "Node.js"],
    requiredTools: ["GraphQL parser", "Semgrep"],
    permissions: ["read-only scan", "approval-gated API changes"],
    commands: ["npm run audit:graphql"],
    parsers: ["GraphQL AST parser"],
    reportTemplates: ["graphql-audit-report"],
    fixTemplates: ["schema docs", "resolver normalization", "auth checks"],
    tests: ["clean schema", "introspection enabled", "broken query"],
    status: SkillStatus.Approved
  }
];

export const proposedSkills = [
  {
    name: "rsc-cache-audit",
    version: "0.1.0",
    description: "Proposed skill for auditing React Server Components cache boundaries and invalidation.",
    triggerRules: ["RSC", "server components", "cache", "revalidate"],
    supportedFrameworks: ["Next.js", "React"],
    requiredTools: ["Static analyzer", "playback traces"],
    permissions: ["read-only scan", "approval-gated fixes"],
    commands: ["npm run audit:rsc"],
    parsers: ["route graph parser"],
    reportTemplates: ["rsc-audit-report"],
    fixTemplates: ["cache boundary", "fetch dedupe", "revalidation hints"],
    tests: ["sample clean repo", "stale cache repo", "broken fetch cache"],
    status: SkillStatus.Proposed
  }
];
