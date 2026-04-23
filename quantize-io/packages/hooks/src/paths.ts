import { homedir } from "node:os";
import { join } from "node:path";

export function quantizeRoot(): string {
  return join(homedir(), ".quantize");
}

export function flagPath(): string {
  return join(quantizeRoot(), "active-mode");
}

export function presencePath(): string {
  return join(quantizeRoot(), "presence.json");
}
