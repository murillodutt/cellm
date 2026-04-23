export const VERSION = "0.1.0" as const;

export {
  COMPRESSIBLE_EXTENSIONS,
  SKIP_EXTENSIONS,
  detectFileType,
  shouldCompress,
} from "./detect.js";
export type { FileType } from "./detect.js";

export {
  validate,
  validateStrings,
  extractHeadings,
  extractCodeBlocks,
  extractUrls,
  extractPaths,
  countBullets,
} from "./validate.js";
export type { ValidationResult, Heading } from "./validate.js";

export { isSensitivePath } from "./sensitive.js";

export { safeWriteFlag, readFlag, SAFE_IO_MAX_FLAG_BYTES } from "./safe-io.js";

export {
  VALID_MODES,
  isValidMode,
  loadRawRules,
  filterRulesByMode,
} from "./rules.js";
export type { Mode } from "./rules.js";

export {
  DEFAULT_CACHE_ROOT,
  createFsCache,
  createMemoryCache,
} from "./cache.js";
export type { Cache, CacheValue } from "./cache.js";

export {
  MAX_FILE_SIZE_BYTES,
  MAX_RETRIES,
  DEFAULT_MODEL,
  stripLlmWrapper,
  buildCompressPrompt,
  buildFixPrompt,
  createSdkCaller,
  createClaudeCliCaller,
  resolveDefaultCaller,
  compressFile,
} from "./compress.js";
export type {
  CallClaude,
  CreateSdkCallerOptions,
  CompressOptions,
  CompressResult,
  CompressEvent,
} from "./compress.js";
