import { getDashboardModel } from "../src/lib/pipeline.js";

const model = getDashboardModel();

console.log(JSON.stringify({
  repo: model.repo.id,
  detection: model.detection,
  approvedSkills: model.approvedSkills.map((skill) => skill.name),
  sandboxResult: model.sandboxResult,
  findings: model.findings.map((finding) => finding.title)
}, null, 2));
