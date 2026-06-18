"use client";

import { useState, useTransition } from "react";
import { ArrowIcon, LogoMark } from "./icons.js";

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function SeverityBadge({ severity }) {
  return <span className={`severity severity-${severity}`}>{severity}</span>;
}

export function DashboardShell({ model }) {
  const [url, setUrl] = useState(model.scanTarget ?? model.repo.target);
  const [report, setReport] = useState(model);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error("Scan failed");
      }

      const data = await response.json();
      startTransition(() => {
        setReport(data.model);
      });
    } catch {
      setError("The scan could not run right now. Check the URL and try again.");
    }
  }

  const findings = report.findings ?? [];
  const executiveSummary = report.reports?.[0]?.executiveSummary ?? "Paste a URL to generate an audit report.";
  const topFix = report.autoHealSummary?.find((item) => item.classification.availability === "safe") ?? report.autoHealSummary?.[0] ?? null;
  const scanStatus = isPending ? "Scanning…" : "Ready";

  return (
    <div className="page">
      <div className="frame">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">
              <LogoMark />
            </div>
            <div>
              <div className="brand-name">The Auditor</div>
              <div className="brand-subtitle">Paste a URL, get an audit, keep the fixes controlled.</div>
            </div>
          </div>
          <span className="status-pill">{scanStatus}</span>
        </header>

        <main className="content">
          <section className="hero-card">
            <p className="eyebrow">Website, webapp, and repo audits</p>
            <h1>Paste a URL. Get a clean audit report.</h1>
            <p className="hero-copy">
              The scan runs in a controlled sandbox, checks the detected stack, and generates a concise report with evidence,
              severity, confidence, and safe fixes.
            </p>

            <form className="scan-form" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="scan-url">
                URL to scan
              </label>
              <input
                id="scan-url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com"
                spellCheck="false"
                autoCapitalize="none"
                autoComplete="off"
                inputMode="url"
              />
              <button type="submit" className="scan-button">
                Scan <ArrowIcon />
              </button>
            </form>

            {error ? <p className="error-text">{error}</p> : null}
          </section>

          <section className="summary-row">
            <article className="summary-card">
              <span className="summary-label">Target</span>
              <strong>{report.scanTarget ?? report.repo.target}</strong>
              <p>{report.repo.kind}</p>
            </article>
            <article className="summary-card">
              <span className="summary-label">Confidence</span>
              <strong>{formatPercent(report.detection.confidence)}</strong>
              <p>Detected stack signals</p>
            </article>
            <article className="summary-card">
              <span className="summary-label">Safe fix</span>
              <strong>{topFix?.classification.availability ?? "none"}</strong>
              <p>{topFix?.title ?? "No safe fix yet"}</p>
            </article>
          </section>

          <section className="report-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Audit report</p>
                <h2>{report.repo.label}</h2>
              </div>
              <div className="stack-line">
                {report.detection.framework.slice(0, 2).map((item) => (
                  <span key={item} className="mini-pill">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <p className="report-summary">{executiveSummary}</p>

            <ul className="finding-list">
              {findings.map((finding) => (
                <li key={finding.id} className="finding-item">
                  <div className="finding-main">
                    <div className="finding-topline">
                      <SeverityBadge severity={finding.severity} />
                      <strong>{finding.title}</strong>
                    </div>
                    <p>{finding.evidence}</p>
                    <div className="finding-meta">
                      <span>{finding.affected}</span>
                      <span>{finding.skill}</span>
                      <span>{finding.tool}</span>
                    </div>
                  </div>

                  <details className="finding-details">
                    <summary>Suggested fix</summary>
                    <p>{finding.suggestedFix}</p>
                    <p>{finding.developerTask}</p>
                    <p>{finding.beforeAfter}</p>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
