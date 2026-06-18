import { getScanModel } from "../../../src/lib/pipeline.js";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const url = typeof body.url === "string" && body.url.trim() ? body.url.trim() : "https://northstar-dashboard.example";
  const model = getScanModel(url);

  return Response.json({
    ok: true,
    approvalRequired: true,
    mode: body.mode === "approved" ? "approved" : "dry-run",
    model
  });
}
