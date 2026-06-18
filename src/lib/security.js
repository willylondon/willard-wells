const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{16,}/g,
  /ghp_[A-Za-z0-9]{20,}/g,
  /github_pat_[A-Za-z0-9_]{20,}/g,
  /xox[baprs]-[A-Za-z0-9-]{10,}/g,
  /AIza[0-9A-Za-z-_]{20,}/g,
  /(?:secret|token|api[_-]?key)\s*[:=]\s*['"]?([A-Za-z0-9_\-./+=]{8,})['"]?/gi
];

export function redactSecrets(value) {
  let text = String(value ?? "");

  for (const pattern of SECRET_PATTERNS) {
    text = text.replace(pattern, "[REDACTED]");
  }

  return text;
}

export function sanitizeUntrustedText(value, maxLength = 3000) {
  return redactSecrets(String(value ?? "").slice(0, maxLength));
}

export function clampNumber(value, min, max) {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return min;
  }
  return Math.min(max, Math.max(min, num));
}
