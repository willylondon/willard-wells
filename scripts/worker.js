import { getDashboardModel } from "../src/lib/pipeline.js";

const model = getDashboardModel();

console.log(`[worker] queue dry-run loaded for ${model.repo.id}`);
console.log(`[worker] proposed skill status: ${model.sandboxResult.status}`);
