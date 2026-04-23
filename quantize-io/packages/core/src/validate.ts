import { readFileSync } from "node:fs";

const URL_REGEX = /https?:\/\/[^\s)]+/g;
const HEADING_REGEX = /^(#{1,6})\s+(.*)$/gm;
const BULLET_REGEX = /^\s*[-*+]\s+/gm;
const FENCE_OPEN_REGEX = /^(\s{0,3})(`{3,}|~{3,})(.*)$/;
const PATH_REGEX =
  /(?:\.\/|\.\.\/|\/|[A-Za-z]:\\)[\w\-/\\.]+|[\w\-.]+[/\\][\w\-/\\.]+/g;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function makeResult(): ValidationResult {
  return { isValid: true, errors: [], warnings: [] };
}

function addError(r: ValidationResult, msg: string): void {
  r.isValid = false;
  r.errors.push(msg);
}

function addWarning(r: ValidationResult, msg: string): void {
  r.warnings.push(msg);
}

export interface Heading {
  level: string;
  title: string;
}

export function extractHeadings(text: string): Heading[] {
  const out: Heading[] = [];
  HEADING_REGEX.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = HEADING_REGEX.exec(text)) !== null) {
    const level = m[1] ?? "";
    const title = (m[2] ?? "").trim();
    out.push({ level, title });
  }
  return out;
}

export function extractCodeBlocks(text: string): string[] {
  const blocks: string[] = [];
  const lines = text.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    const m = FENCE_OPEN_REGEX.exec(line);
    if (!m) {
      i += 1;
      continue;
    }
    const fenceRun = m[2] ?? "";
    const fenceChar = fenceRun[0] ?? "";
    const fenceLen = fenceRun.length;
    const blockLines: string[] = [line];
    i += 1;
    let closed = false;
    while (i < lines.length) {
      const inner = lines[i] ?? "";
      const close = FENCE_OPEN_REGEX.exec(inner);
      const closeRun = close?.[2] ?? "";
      const closeTail = (close?.[3] ?? "").trim();
      if (
        close &&
        closeRun[0] === fenceChar &&
        closeRun.length >= fenceLen &&
        closeTail === ""
      ) {
        blockLines.push(inner);
        closed = true;
        i += 1;
        break;
      }
      blockLines.push(inner);
      i += 1;
    }
    if (closed) blocks.push(blockLines.join("\n"));
  }
  return blocks;
}

export function extractUrls(text: string): Set<string> {
  return new Set(text.match(URL_REGEX) ?? []);
}

export function extractPaths(text: string): Set<string> {
  return new Set(text.match(PATH_REGEX) ?? []);
}

export function countBullets(text: string): number {
  return (text.match(BULLET_REGEX) ?? []).length;
}

function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

function setDiff<T>(a: Set<T>, b: Set<T>): Set<T> {
  const out = new Set<T>();
  for (const x of a) if (!b.has(x)) out.add(x);
  return out;
}

function headingsEqual(a: readonly Heading[], b: readonly Heading[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const x = a[i];
    const y = b[i];
    if (!x || !y || x.level !== y.level || x.title !== y.title) return false;
  }
  return true;
}

export function validateStrings(
  orig: string,
  comp: string,
): ValidationResult {
  const result = makeResult();

  const h1 = extractHeadings(orig);
  const h2 = extractHeadings(comp);
  if (h1.length !== h2.length) {
    addError(result, `Heading count mismatch: ${h1.length} vs ${h2.length}`);
  }
  if (!headingsEqual(h1, h2)) {
    addWarning(result, "Heading text/order changed");
  }

  const c1 = extractCodeBlocks(orig);
  const c2 = extractCodeBlocks(comp);
  const sameCode =
    c1.length === c2.length && c1.every((v, i) => v === c2[i]);
  if (!sameCode) {
    addError(result, "Code blocks not preserved exactly");
  }

  const u1 = extractUrls(orig);
  const u2 = extractUrls(comp);
  if (!setsEqual(u1, u2)) {
    const lost = [...setDiff(u1, u2)].join(",");
    const added = [...setDiff(u2, u1)].join(",");
    addError(result, `URL mismatch: lost={${lost}}, added={${added}}`);
  }

  const p1 = extractPaths(orig);
  const p2 = extractPaths(comp);
  if (!setsEqual(p1, p2)) {
    const lost = [...setDiff(p1, p2)].join(",");
    const added = [...setDiff(p2, p1)].join(",");
    addWarning(result, `Path mismatch: lost={${lost}}, added={${added}}`);
  }

  const b1 = countBullets(orig);
  const b2 = countBullets(comp);
  if (b1 > 0) {
    const diff = Math.abs(b1 - b2) / b1;
    if (diff > 0.15) {
      addWarning(result, `Bullet count changed too much: ${b1} -> ${b2}`);
    }
  }

  return result;
}

export function validate(
  originalPath: string,
  compressedPath: string,
): ValidationResult {
  const orig = readFileSync(originalPath, "utf8");
  const comp = readFileSync(compressedPath, "utf8");
  return validateStrings(orig, comp);
}
