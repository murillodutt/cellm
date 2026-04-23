import { basename, sep } from "node:path";

const SENSITIVE_BASENAME_REGEX =
  /^(\.env(\..+)?|\.netrc|credentials(\..+)?|secrets?(\..+)?|passwords?(\..+)?|id_(rsa|dsa|ecdsa|ed25519)(\.pub)?|authorized_keys|known_hosts|.*\.(pem|key|p12|pfx|crt|cer|jks|keystore|asc|gpg))$/i;

const SENSITIVE_PATH_COMPONENTS: ReadonlySet<string> = new Set([
  ".ssh",
  ".aws",
  ".gnupg",
  ".kube",
  ".docker",
]);

const SENSITIVE_NAME_TOKENS: readonly string[] = [
  "secret",
  "credential",
  "password",
  "passwd",
  "apikey",
  "accesskey",
  "token",
  "privatekey",
];

function splitParts(filepath: string): string[] {
  const normalized = filepath.replaceAll("\\", "/");
  return normalized.split("/").filter((p) => p !== "");
}

export function isSensitivePath(filepath: string): boolean {
  const name = basename(filepath);
  if (SENSITIVE_BASENAME_REGEX.test(name)) return true;

  const parts = splitParts(filepath);
  for (const p of parts) {
    if (SENSITIVE_PATH_COMPONENTS.has(p.toLowerCase())) return true;
  }

  const normalized = name.toLowerCase().replace(/[_\-\s.]/g, "");
  for (const token of SENSITIVE_NAME_TOKENS) {
    if (normalized.includes(token)) return true;
  }
  return false;
}

export const SENSITIVE_PATH_COMPONENTS_FOR_TEST = SENSITIVE_PATH_COMPONENTS;
export const SENSITIVE_NAME_TOKENS_FOR_TEST = SENSITIVE_NAME_TOKENS;

// Preserve `sep` reference so platform-specific behavior (e.g. Windows) can be
// asserted if ever needed. Not directly used — kept as an explicit annotation
// that sensitive.ts normalizes to forward slashes internally.
export const PLATFORM_SEP = sep;
