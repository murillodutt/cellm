import { constants, closeSync, fchmodSync, lstatSync, mkdirSync, openSync, readSync, renameSync, writeSync } from "node:fs";
import { Buffer } from "node:buffer";
import { dirname, join } from "node:path";

const MAX_FLAG_BYTES = 64;

function nofollowFlag(): number {
  const c = constants as unknown as { O_NOFOLLOW?: number };
  return typeof c.O_NOFOLLOW === "number" ? c.O_NOFOLLOW : 0;
}

export function safeWriteFlag(flagPath: string, content: string): void {
  try {
    const flagDir = dirname(flagPath);
    mkdirSync(flagDir, { recursive: true });

    try {
      if (lstatSync(flagDir).isSymbolicLink()) return;
    } catch {
      return;
    }

    try {
      if (lstatSync(flagPath).isSymbolicLink()) return;
    } catch (e: unknown) {
      const err = e as NodeJS.ErrnoException;
      if (err.code !== "ENOENT") return;
    }

    const tempPath = join(
      flagDir,
      `.quantize-flag.${process.pid}.${Date.now()}`,
    );
    const flags =
      constants.O_WRONLY |
      constants.O_CREAT |
      constants.O_EXCL |
      nofollowFlag();

    let fd: number | undefined;
    try {
      fd = openSync(tempPath, flags, 0o600);
      writeSync(fd, String(content));
      try {
        fchmodSync(fd, 0o600);
      } catch {
        /* best-effort on platforms that don't support fchmod */
      }
    } finally {
      if (fd !== undefined) closeSync(fd);
    }
    renameSync(tempPath, flagPath);
  } catch {
    /* silent fail — flag is best-effort */
  }
}

export function readFlag(
  flagPath: string,
  whitelist: readonly string[],
): string | null {
  try {
    let st: ReturnType<typeof lstatSync>;
    try {
      st = lstatSync(flagPath);
    } catch {
      return null;
    }
    if (st.isSymbolicLink() || !st.isFile()) return null;
    if (st.size > MAX_FLAG_BYTES) return null;

    const flags = constants.O_RDONLY | nofollowFlag();
    let fd: number | undefined;
    let out: string;
    try {
      fd = openSync(flagPath, flags);
      const buf = Buffer.alloc(MAX_FLAG_BYTES);
      const n = readSync(fd, buf, 0, MAX_FLAG_BYTES, 0);
      out = buf.subarray(0, n).toString("utf8");
    } finally {
      if (fd !== undefined) closeSync(fd);
    }

    const raw = out.trim().toLowerCase();
    if (!whitelist.includes(raw)) return null;
    return raw;
  } catch {
    return null;
  }
}

export const SAFE_IO_MAX_FLAG_BYTES = MAX_FLAG_BYTES;
