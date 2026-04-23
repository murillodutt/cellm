import { spawnSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";

import { shouldCompress } from "./detect.js";
import { isSensitivePath } from "./sensitive.js";
import { validate, type ValidationResult } from "./validate.js";
import { createMemoryCache, type Cache } from "./cache.js";

export const MAX_FILE_SIZE_BYTES = 500_000;
export const MAX_RETRIES = 2;
export const DEFAULT_MODEL = "claude-sonnet-4-5";

const OUTER_FENCE_REGEX = /^\s*(`{3,}|~{3,})[^\n]*\n([\s\S]*)\n\1\s*$/;

export function stripLlmWrapper(text: string): string {
  const m = OUTER_FENCE_REGEX.exec(text);
  if (m) return m[2] ?? text;
  return text;
}

export function buildCompressPrompt(original: string): string {
  return `
Compress this markdown into quantize-io format.

STRICT RULES:
- Do NOT modify anything inside \`\`\` code blocks
- Do NOT modify anything inside inline backticks
- Preserve ALL URLs exactly
- Preserve ALL headings exactly
- Preserve file paths and commands
- Return ONLY the compressed markdown body — do NOT wrap the entire output in a \`\`\`markdown fence or any other fence. Inner code blocks from the original stay as-is; do not add a new outer fence around the whole file.

Only compress natural language.

TEXT:
${original}
`;
}

export function buildFixPrompt(
  original: string,
  compressed: string,
  errors: readonly string[],
): string {
  const errorsStr = errors.map((e) => `- ${e}`).join("\n");
  return `You are fixing a quantize-io-compressed markdown file. Specific validation errors were found.

CRITICAL RULES:
- DO NOT recompress or rephrase the file
- ONLY fix the listed errors — leave everything else exactly as-is
- The ORIGINAL is provided as reference only (to restore missing content)
- Preserve the existing compression style in all untouched sections

ERRORS TO FIX:
${errorsStr}

HOW TO FIX:
- Missing URL: find it in ORIGINAL, restore it exactly where it belongs in COMPRESSED
- Code block mismatch: find the exact code block in ORIGINAL, restore it in COMPRESSED
- Heading mismatch: restore the exact heading text from ORIGINAL into COMPRESSED
- Do not touch any section not mentioned in the errors

ORIGINAL (reference only):
${original}

COMPRESSED (fix this):
${compressed}

Return ONLY the fixed compressed file. No explanation.
`;
}

export type CallClaude = (prompt: string) => Promise<string>;

export interface CreateSdkCallerOptions {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

export async function createSdkCaller(
  opts: CreateSdkCallerOptions,
): Promise<CallClaude> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: opts.apiKey });
  const model = opts.model ?? DEFAULT_MODEL;
  const maxTokens = opts.maxTokens ?? 8192;

  return async (prompt: string) => {
    const msg = await client.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });
    const first = msg.content[0];
    if (!first || first.type !== "text") {
      throw new Error("Anthropic SDK returned non-text content block");
    }
    return stripLlmWrapper(first.text.trim());
  };
}

export function createClaudeCliCaller(): CallClaude {
  return async (prompt: string) => {
    const result = spawnSync("claude", ["--print"], {
      input: prompt,
      encoding: "utf8",
    });
    if (result.status !== 0) {
      const stderr = result.stderr ?? "";
      throw new Error(`Claude CLI call failed:\n${stderr}`);
    }
    return stripLlmWrapper((result.stdout ?? "").trim());
  };
}

export async function resolveDefaultCaller(): Promise<CallClaude> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (apiKey && apiKey.length > 0) {
    return await createSdkCaller({ apiKey });
  }
  return createClaudeCliCaller();
}

export type CompressEvent =
  | { type: "start"; path: string }
  | { type: "skip"; path: string; reason: string }
  | { type: "cache-hit"; path: string; key: string }
  | { type: "compressed"; path: string; attempt: number }
  | { type: "validation-failed"; path: string; attempt: number; errors: string[] }
  | { type: "fixed"; path: string; attempt: number }
  | { type: "rollback"; path: string }
  | { type: "done"; path: string; bytesIn: number; bytesOut: number };

export interface CompressOptions {
  filepath: string;
  callClaude?: CallClaude;
  cache?: Cache;
  mode?: string;
  model?: string;
  onEvent?: (event: CompressEvent) => void;
}

export interface CompressResult {
  compressed: boolean;
  reason?: string;
  bytesIn: number;
  bytesOut: number;
  cacheHit: boolean;
  retries: number;
  rolledBack: boolean;
}

function emit(options: CompressOptions, event: CompressEvent): void {
  options.onEvent?.(event);
}

export async function compressFile(
  options: CompressOptions,
): Promise<CompressResult> {
  const filepath = resolve(options.filepath);
  const cache = options.cache ?? createMemoryCache();
  const mode = options.mode ?? "full";
  const model = options.model ?? process.env["QT_MODEL"] ?? DEFAULT_MODEL;
  const callClaude = options.callClaude ?? (await resolveDefaultCaller());

  emit(options, { type: "start", path: filepath });

  if (!existsSync(filepath)) {
    throw new Error(`File not found: ${filepath}`);
  }

  const st = statSync(filepath);
  if (st.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File too large to compress safely (max ${MAX_FILE_SIZE_BYTES}B): ${filepath}`,
    );
  }

  if (isSensitivePath(filepath)) {
    throw new Error(
      `Refusing to compress ${filepath}: filename looks sensitive ` +
        "(credentials, keys, secrets, or known private paths). " +
        "Compression sends file contents to the Anthropic API. " +
        "Rename the file if this is a false positive.",
    );
  }

  if (!shouldCompress(filepath)) {
    emit(options, { type: "skip", path: filepath, reason: "not natural_language" });
    return {
      compressed: false,
      reason: "not natural_language",
      bytesIn: st.size,
      bytesOut: st.size,
      cacheHit: false,
      retries: 0,
      rolledBack: false,
    };
  }

  const original = readFileSync(filepath, "utf8");
  const stem = basename(filepath, extname(filepath));
  const backup = join(dirname(filepath), `${stem}.original.md`);

  if (existsSync(backup)) {
    emit(options, { type: "skip", path: filepath, reason: "backup exists" });
    return {
      compressed: false,
      reason: "backup exists",
      bytesIn: st.size,
      bytesOut: st.size,
      cacheHit: false,
      retries: 0,
      rolledBack: false,
    };
  }

  const cacheKey = cache.keyFor(original, model, mode);
  const hit = await cache.get(cacheKey);
  if (hit) {
    emit(options, { type: "cache-hit", path: filepath, key: cacheKey });
    writeFileSync(backup, original);
    atomicWrite(filepath, hit.compressed);
    emit(options, {
      type: "done",
      path: filepath,
      bytesIn: st.size,
      bytesOut: Buffer.byteLength(hit.compressed, "utf8"),
    });
    return {
      compressed: true,
      bytesIn: st.size,
      bytesOut: Buffer.byteLength(hit.compressed, "utf8"),
      cacheHit: true,
      retries: 0,
      rolledBack: false,
    };
  }

  let compressed = await callClaude(buildCompressPrompt(original));
  emit(options, { type: "compressed", path: filepath, attempt: 0 });

  writeFileSync(backup, original);
  atomicWrite(filepath, compressed);

  let retries = 0;
  let lastResult: ValidationResult = validate(backup, filepath);
  while (!lastResult.isValid && retries < MAX_RETRIES) {
    emit(options, {
      type: "validation-failed",
      path: filepath,
      attempt: retries,
      errors: [...lastResult.errors],
    });
    compressed = await callClaude(
      buildFixPrompt(original, compressed, lastResult.errors),
    );
    atomicWrite(filepath, compressed);
    emit(options, { type: "fixed", path: filepath, attempt: retries + 1 });
    retries += 1;
    lastResult = validate(backup, filepath);
  }

  if (!lastResult.isValid) {
    atomicWrite(filepath, original);
    try {
      unlinkSync(backup);
    } catch {
      /* best effort */
    }
    emit(options, { type: "rollback", path: filepath });
    return {
      compressed: false,
      reason: "validation failed after retries",
      bytesIn: st.size,
      bytesOut: st.size,
      cacheHit: false,
      retries,
      rolledBack: true,
    };
  }

  const bytesOut = Buffer.byteLength(compressed, "utf8");
  await cache.set(cacheKey, {
    compressed,
    tokensIn: 0,
    tokensOut: 0,
    model,
    mode,
    timestamp: Date.now(),
  });

  emit(options, { type: "done", path: filepath, bytesIn: st.size, bytesOut });
  return {
    compressed: true,
    bytesIn: st.size,
    bytesOut,
    cacheHit: false,
    retries,
    rolledBack: false,
  };
}

function atomicWrite(target: string, content: string): void {
  const temp = `${target}.quantize.tmp.${process.pid}.${Date.now()}`;
  writeFileSync(temp, content);
  renameSync(temp, target);
}
