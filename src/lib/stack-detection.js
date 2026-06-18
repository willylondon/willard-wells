import { sanitizeUntrustedText } from "./security.js";

const FRAMEWORK_PATTERNS = [
  ["Next.js", /"next"\s*:/i, /next\.config\.(mjs|js|ts)/i],
  ["React", /"react"\s*:/i, /react-dom/i],
  ["Remix", /@remix-run/i, /remix\.config/i],
  ["Astro", /"astro"\s*:/i, /astro\.config/i],
  ["Nuxt", /"nuxt"\s*:/i, /nuxt\.config/i],
  ["SvelteKit", /@sveltejs\/kit/i, /svelte\.config/i]
];

const HOSTING_PATTERNS = [
  ["Vercel", /x-vercel-id/i, /vercel\.json/i],
  ["Netlify", /x-nf-request-id/i, /netlify\.toml/i],
  ["Cloudflare", /cf-ray/i, /wrangler\.toml/i],
  ["GitHub Pages", /github\.io/i, /docs\/?build/i]
];

const CMS_PATTERNS = [
  ["WordPress", /wp-content/i, /wp-json/i, /generator[^>]+WordPress/i],
  ["Sanity", /sanity\.io/i, /sanity\.config/i],
  ["Contentful", /contentful/i],
  ["Shopify", /cdn\.shopify\.com/i, /shopify/i]
];

const AUTH_PATTERNS = [
  ["Clerk", /@clerk\/nextjs/i, /clerk\.dev/i],
  ["Auth0", /auth0/i],
  ["NextAuth", /next-auth/i],
  ["Supabase Auth", /@supabase\/supabase-js/i, /supabase\.co/i]
];

const PAYMENT_PATTERNS = [
  ["Stripe", /stripe/i, /checkout\.session/i],
  ["PayPal", /paypal/i],
  ["Shop Pay", /shop\s?pay/i]
];

function detectByPatterns(text, patterns) {
  const result = [];
  for (const pattern of patterns) {
    const [label, ...regexes] = pattern;
    if (regexes.some((regex) => regex.test(text))) {
      result.push(label);
    }
  }
  return result;
}

function detectPackageManager(files) {
  if (files.some((file) => /pnpm-lock\.yaml$/i.test(file))) {
    return "pnpm";
  }
  if (files.some((file) => /yarn\.lock$/i.test(file))) {
    return "yarn";
  }
  if (files.some((file) => /package-lock\.json$/i.test(file))) {
    return "npm";
  }
  if (files.some((file) => /bun\.lockb$/i.test(file))) {
    return "bun";
  }
  return "unknown";
}

function detectBuildSystem(text) {
  const matches = [];
  if (/next\s+build/i.test(text) || /next dev/i.test(text)) {
    matches.push("Next.js");
  }
  if (/vite/i.test(text)) {
    matches.push("Vite");
  }
  if (/astro/i.test(text)) {
    matches.push("Astro");
  }
  if (/turbo/i.test(text)) {
    matches.push("Turbopack/Turbo");
  }
  return matches.length ? matches : ["unknown"];
}

export function detectStack(input = {}) {
  const rawText = sanitizeUntrustedText(
    [
      input.packageJson,
      input.files?.join("\n"),
      input.headers ? JSON.stringify(input.headers) : "",
      input.html,
      input.meta
    ]
      .filter(Boolean)
      .join("\n\n"),
    12000
  );

  const files = Array.isArray(input.files) ? input.files.map(String) : [];
  const packageManager = detectPackageManager(files);
  const framework = detectByPatterns(rawText, FRAMEWORK_PATTERNS);
  const hostingProvider = detectByPatterns(rawText, HOSTING_PATTERNS);
  const cms = detectByPatterns(rawText, CMS_PATTERNS);
  const authProvider = detectByPatterns(rawText, AUTH_PATTERNS);
  const paymentProvider = detectByPatterns(rawText, PAYMENT_PATTERNS);
  const frontendStack = [];
  const backendStack = [];
  const database = [];
  const apiStructure = [];

  if (/tailwind/i.test(rawText)) frontendStack.push("Tailwind CSS");
  if (/radix/i.test(rawText)) frontendStack.push("Radix UI");
  if (/shadcn/i.test(rawText)) frontendStack.push("shadcn/ui");
  if (/nextauth|auth0|clerk/i.test(rawText)) backendStack.push("Auth integrations");
  if (/supabase/i.test(rawText)) database.push("Supabase/PostgreSQL");
  if (/postgres/i.test(rawText)) database.push("PostgreSQL");
  if (/graphql/i.test(rawText)) apiStructure.push("GraphQL");
  if (/rest/i.test(rawText)) apiStructure.push("REST");
  if (/rsc|server components/i.test(rawText)) apiStructure.push("RSC");
  if (/node\.js|express|fastify|nest/i.test(rawText)) backendStack.push("Node.js");
  if (/route handlers|app\/api/i.test(rawText)) backendStack.push("Next.js Route Handlers");
  if (/mdx|markdown/i.test(rawText)) frontendStack.push("MDX/Content");

  const buildSystem = detectBuildSystem(rawText);
  const evidence = [];
  if (framework.length) evidence.push(`Detected frameworks: ${framework.join(", ")}`);
  if (hostingProvider.length) evidence.push(`Hosting hints: ${hostingProvider.join(", ")}`);
  if (cms.length) evidence.push(`CMS hints: ${cms.join(", ")}`);
  if (authProvider.length) evidence.push(`Auth hints: ${authProvider.join(", ")}`);
  if (paymentProvider.length) evidence.push(`Payment hints: ${paymentProvider.join(", ")}`);
  if (database.length) evidence.push(`Database hints: ${database.join(", ")}`);
  if (apiStructure.length) evidence.push(`API hints: ${apiStructure.join(", ")}`);

  const signalCount =
    framework.length +
    hostingProvider.length +
    cms.length +
    frontendStack.length +
    backendStack.length +
    database.length +
    authProvider.length +
    paymentProvider.length +
    apiStructure.length +
    buildSystem.length;

  return {
    framework: framework.length ? framework : ["unknown"],
    packageManager,
    hostingProvider: hostingProvider.length ? hostingProvider : ["unknown"],
    cms: cms.length ? cms : ["unknown"],
    frontendStack: frontendStack.length ? frontendStack : ["unknown"],
    backendStack: backendStack.length ? backendStack : ["unknown"],
    database: database.length ? database : ["unknown"],
    authProvider: authProvider.length ? authProvider : ["unknown"],
    paymentProvider: paymentProvider.length ? paymentProvider : ["unknown"],
    apiStructure: apiStructure.length ? apiStructure : ["unknown"],
    buildSystem,
    confidence: Math.min(0.99, 0.45 + signalCount * 0.08),
    evidence
  };
}
