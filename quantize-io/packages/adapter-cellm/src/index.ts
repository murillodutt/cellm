export const ADAPTER_NAME = "@quantize-io/adapter-cellm" as const;

export {
  QuantizeCompressInput,
  createQuantizeTool,
  resolveDaemonUrl,
} from "./tool.js";
export type {
  CompressResponse,
  QuantizeTool,
  QuantizeToolOptions,
  ResolveDaemonUrlOptions,
  TimelineEmitter,
  TimelineEventInput,
} from "./tool.js";
