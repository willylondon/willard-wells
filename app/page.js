import { DashboardShell } from "../src/components/dashboard-shell.js";
import { getDashboardModel } from "../src/lib/pipeline.js";

export default function Page() {
  const model = getDashboardModel();

  return <DashboardShell model={model} />;
}
