import { readFileSync, statSync } from "node:fs";
import { basename, extname } from "node:path";

export type FileType = "natural_language" | "code" | "config" | "unknown";

export const COMPRESSIBLE_EXTENSIONS: ReadonlySet<string> = new Set([
  ".md",
  ".txt",
  ".markdown",
  ".rst",
]);

export const SKIP_EXTENSIONS: ReadonlySet<string> = new Set([
  ".py", ".js", ".ts", ".tsx", ".jsx", ".json", ".yaml", ".yml",
  ".toml", ".env", ".lock", ".css", ".scss", ".html", ".xml",
  ".sql", ".sh", ".bash", ".zsh", ".go", ".rs", ".java", ".c",
  ".cpp", ".h", ".hpp", ".rb", ".php", ".swift", ".kt", ".lua",
  ".dockerfile", ".makefile", ".csv", ".ini", ".cfg",
]);

const CONFIG_EXTS: ReadonlySet<string> = new Set([
  ".json", ".yaml", ".yml", ".toml", ".ini", ".cfg", ".env",
]);

const CODE_PATTERNS: readonly RegExp[] = [
  /^\s*(import |from .+ import |require\(|const |let |var )/,
  /^\s*(def |class |function |async function |export )/,
  /^\s*(if\s*\(|for\s*\(|while\s*\(|switch\s*\(|try\s*\{)/,
  /^\s*[\}\]\);]+\s*$/,
  /^\s*@\w+/,
  /^\s*"[^"]+"\s*:\s*/,
  /^\s*\w+\s*=\s*[{\[("']/,
];

function isCodeLine(line: string): boolean {
  for (const p of CODE_PATTERNS) {
    if (p.test(line)) return true;
  }
  return false;
}

function isJsonContent(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

function isYamlContent(lines: readonly string[]): boolean {
  const window = lines.slice(0, 30);
  let indicators = 0;
  let nonEmpty = 0;
  for (const raw of window) {
    const stripped = raw.trim();
    if (stripped) nonEmpty += 1;
    if (stripped.startsWith("---")) {
      indicators += 1;
    } else if (/^\w[\w\s]*:\s/.test(stripped)) {
      indicators += 1;
    } else if (stripped.startsWith("- ") && stripped.includes(":")) {
      indicators += 1;
    }
  }
  return nonEmpty > 0 && indicators / nonEmpty > 0.6;
}

export function detectFileType(filepath: string): FileType {
  const ext = extname(filepath).toLowerCase();
  if (ext) {
    if (COMPRESSIBLE_EXTENSIONS.has(ext)) return "natural_language";
    if (SKIP_EXTENSIONS.has(ext)) return CONFIG_EXTS.has(ext) ? "config" : "code";
    return "unknown";
  }
  // Extensionless
  let text: string;
  try {
    text = readFileSync(filepath, "utf8");
  } catch {
    return "unknown";
  }
  const lines = text.split(/\r?\n/).slice(0, 50);
  if (isJsonContent(text.slice(0, 10000))) return "config";
  if (isYamlContent(lines)) return "config";
  let codeLines = 0;
  let nonEmpty = 0;
  for (const l of lines) {
    if (!l.trim()) continue;
    nonEmpty += 1;
    if (isCodeLine(l)) codeLines += 1;
  }
  if (nonEmpty > 0 && codeLines / nonEmpty > 0.4) return "code";
  return "natural_language";
}

export function shouldCompress(filepath: string): boolean {
  let st;
  try {
    st = statSync(filepath);
  } catch {
    return false;
  }
  if (!st.isFile()) return false;
  if (basename(filepath).endsWith(".original.md")) return false;
  return detectFileType(filepath) === "natural_language";
}
