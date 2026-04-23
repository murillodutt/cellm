#!/usr/bin/env node
// @bun

// node_modules/.bun/citty@0.2.2/node_modules/citty/dist/_chunks/libs/scule.mjs
var NUMBER_CHAR_RE = /\d/;
var STR_SPLITTERS = [
  "-",
  "_",
  "/",
  "."
];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char))
    return;
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = separators ?? STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string")
    return parts;
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = undefined;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function upperFirst(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : "";
}
function lowerFirst(str) {
  return str ? str[0].toLowerCase() + str.slice(1) : "";
}
function pascalCase(str, opts) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => upperFirst(opts?.normalize ? p.toLowerCase() : p)).join("") : "";
}
function camelCase(str, opts) {
  return lowerFirst(pascalCase(str || "", opts));
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner ?? "-") : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

// node_modules/.bun/citty@0.2.2/node_modules/citty/dist/index.mjs
import { parseArgs as parseArgs$1 } from "util";
function toArray(val) {
  if (Array.isArray(val))
    return val;
  return val === undefined ? [] : [val];
}
function formatLineColumns(lines, linePrefix = "") {
  const maxLength = [];
  for (const line of lines)
    for (const [i, element] of line.entries())
      maxLength[i] = Math.max(maxLength[i] || 0, element.length);
  return lines.map((l) => l.map((c, i) => linePrefix + c[i === 0 ? "padStart" : "padEnd"](maxLength[i])).join("  ")).join(`
`);
}
function resolveValue(input) {
  return typeof input === "function" ? input() : input;
}
var CLIError = class extends Error {
  code;
  constructor(message, code) {
    super(message);
    this.name = "CLIError";
    this.code = code;
  }
};
function parseRawArgs(args = [], opts = {}) {
  const booleans = new Set(opts.boolean || []);
  const strings = new Set(opts.string || []);
  const aliasMap = opts.alias || {};
  const defaults = opts.default || {};
  const aliasToMain = /* @__PURE__ */ new Map;
  const mainToAliases = /* @__PURE__ */ new Map;
  for (const [key, value] of Object.entries(aliasMap)) {
    const targets = value;
    for (const target of targets) {
      aliasToMain.set(key, target);
      if (!mainToAliases.has(target))
        mainToAliases.set(target, []);
      mainToAliases.get(target).push(key);
      aliasToMain.set(target, key);
      if (!mainToAliases.has(key))
        mainToAliases.set(key, []);
      mainToAliases.get(key).push(target);
    }
  }
  const options = {};
  function getType(name) {
    if (booleans.has(name))
      return "boolean";
    const aliases = mainToAliases.get(name) || [];
    for (const alias of aliases)
      if (booleans.has(alias))
        return "boolean";
    return "string";
  }
  function isStringType(name) {
    if (strings.has(name))
      return true;
    const aliases = mainToAliases.get(name) || [];
    for (const alias of aliases)
      if (strings.has(alias))
        return true;
    return false;
  }
  const allOptions = new Set([
    ...booleans,
    ...strings,
    ...Object.keys(aliasMap),
    ...Object.values(aliasMap).flat(),
    ...Object.keys(defaults)
  ]);
  for (const name of allOptions)
    if (!options[name])
      options[name] = {
        type: getType(name),
        default: defaults[name]
      };
  for (const [alias, main] of aliasToMain.entries())
    if (alias.length === 1 && options[main] && !options[main].short)
      options[main].short = alias;
  const processedArgs = [];
  const negatedFlags = {};
  for (let i = 0;i < args.length; i++) {
    const arg = args[i];
    if (arg === "--") {
      processedArgs.push(...args.slice(i));
      break;
    }
    if (arg.startsWith("--no-")) {
      const flagName = arg.slice(5);
      negatedFlags[flagName] = true;
      continue;
    }
    processedArgs.push(arg);
  }
  let parsed;
  try {
    parsed = parseArgs$1({
      args: processedArgs,
      options: Object.keys(options).length > 0 ? options : undefined,
      allowPositionals: true,
      strict: false
    });
  } catch {
    parsed = {
      values: {},
      positionals: processedArgs
    };
  }
  const out = { _: [] };
  out._ = parsed.positionals;
  for (const [key, value] of Object.entries(parsed.values)) {
    let coerced = value;
    if (getType(key) === "boolean" && typeof value === "string")
      coerced = value !== "false";
    else if (isStringType(key) && typeof value === "boolean")
      coerced = "";
    out[key] = coerced;
  }
  for (const [name] of Object.entries(negatedFlags)) {
    out[name] = false;
    const mainName = aliasToMain.get(name);
    if (mainName)
      out[mainName] = false;
    const aliases = mainToAliases.get(name);
    if (aliases)
      for (const alias of aliases)
        out[alias] = false;
  }
  for (const [alias, main] of aliasToMain.entries()) {
    if (out[alias] !== undefined && out[main] === undefined)
      out[main] = out[alias];
    if (out[main] !== undefined && out[alias] === undefined)
      out[alias] = out[main];
    if (out[alias] !== out[main] && defaults[main] === out[main])
      out[main] = out[alias];
  }
  return out;
}
var noColor = /* @__PURE__ */ (() => {
  const env = globalThis.process?.env ?? {};
  return env.NO_COLOR === "1" || env.TERM === "dumb" || env.TEST || env.CI;
})();
var _c = (c, r = 39) => (t) => noColor ? t : `\x1B[${c}m${t}\x1B[${r}m`;
var bold = /* @__PURE__ */ _c(1, 22);
var cyan = /* @__PURE__ */ _c(36);
var gray = /* @__PURE__ */ _c(90);
var underline = /* @__PURE__ */ _c(4, 24);
function parseArgs(rawArgs, argsDef) {
  const parseOptions = {
    boolean: [],
    string: [],
    alias: {},
    default: {}
  };
  const args = resolveArgs(argsDef);
  for (const arg of args) {
    if (arg.type === "positional")
      continue;
    if (arg.type === "string" || arg.type === "enum")
      parseOptions.string.push(arg.name);
    else if (arg.type === "boolean")
      parseOptions.boolean.push(arg.name);
    if (arg.default !== undefined)
      parseOptions.default[arg.name] = arg.default;
    if (arg.alias)
      parseOptions.alias[arg.name] = arg.alias;
    const camelName = camelCase(arg.name);
    const kebabName = kebabCase(arg.name);
    if (camelName !== arg.name || kebabName !== arg.name) {
      const existingAliases = toArray(parseOptions.alias[arg.name] || []);
      if (camelName !== arg.name && !existingAliases.includes(camelName))
        existingAliases.push(camelName);
      if (kebabName !== arg.name && !existingAliases.includes(kebabName))
        existingAliases.push(kebabName);
      if (existingAliases.length > 0)
        parseOptions.alias[arg.name] = existingAliases;
    }
  }
  const parsed = parseRawArgs(rawArgs, parseOptions);
  const [...positionalArguments] = parsed._;
  const parsedArgsProxy = new Proxy(parsed, { get(target, prop) {
    return target[prop] ?? target[camelCase(prop)] ?? target[kebabCase(prop)];
  } });
  for (const [, arg] of args.entries())
    if (arg.type === "positional") {
      const nextPositionalArgument = positionalArguments.shift();
      if (nextPositionalArgument !== undefined)
        parsedArgsProxy[arg.name] = nextPositionalArgument;
      else if (arg.default === undefined && arg.required !== false)
        throw new CLIError(`Missing required positional argument: ${arg.name.toUpperCase()}`, "EARG");
      else
        parsedArgsProxy[arg.name] = arg.default;
    } else if (arg.type === "enum") {
      const argument = parsedArgsProxy[arg.name];
      const options = arg.options || [];
      if (argument !== undefined && options.length > 0 && !options.includes(argument))
        throw new CLIError(`Invalid value for argument: ${cyan(`--${arg.name}`)} (${cyan(argument)}). Expected one of: ${options.map((o) => cyan(o)).join(", ")}.`, "EARG");
    } else if (arg.required && parsedArgsProxy[arg.name] === undefined)
      throw new CLIError(`Missing required argument: --${arg.name}`, "EARG");
  return parsedArgsProxy;
}
function resolveArgs(argsDef) {
  const args = [];
  for (const [name, argDef] of Object.entries(argsDef || {}))
    args.push({
      ...argDef,
      name,
      alias: toArray(argDef.alias)
    });
  return args;
}
async function resolvePlugins(plugins) {
  return Promise.all(plugins.map((p) => resolveValue(p)));
}
function defineCommand(def) {
  return def;
}
async function runCommand(cmd, opts) {
  const cmdArgs = await resolveValue(cmd.args || {});
  const parsedArgs = parseArgs(opts.rawArgs, cmdArgs);
  const context = {
    rawArgs: opts.rawArgs,
    args: parsedArgs,
    data: opts.data,
    cmd
  };
  const plugins = await resolvePlugins(cmd.plugins ?? []);
  let result;
  let runError;
  try {
    for (const plugin of plugins)
      await plugin.setup?.(context);
    if (typeof cmd.setup === "function")
      await cmd.setup(context);
    const subCommands = await resolveValue(cmd.subCommands);
    if (subCommands && Object.keys(subCommands).length > 0) {
      const subCommandArgIndex = findSubCommandIndex(opts.rawArgs, cmdArgs);
      const explicitName = opts.rawArgs[subCommandArgIndex];
      if (explicitName) {
        const subCommand = await _findSubCommand(subCommands, explicitName);
        if (!subCommand)
          throw new CLIError(`Unknown command ${cyan(explicitName)}`, "E_UNKNOWN_COMMAND");
        await runCommand(subCommand, { rawArgs: opts.rawArgs.slice(subCommandArgIndex + 1) });
      } else {
        const defaultSubCommand = await resolveValue(cmd.default);
        if (defaultSubCommand) {
          if (cmd.run)
            throw new CLIError(`Cannot specify both 'run' and 'default' on the same command.`, "E_DEFAULT_CONFLICT");
          const subCommand = await _findSubCommand(subCommands, defaultSubCommand);
          if (!subCommand)
            throw new CLIError(`Default sub command ${cyan(defaultSubCommand)} not found in subCommands.`, "E_UNKNOWN_COMMAND");
          await runCommand(subCommand, { rawArgs: opts.rawArgs });
        } else if (!cmd.run)
          throw new CLIError(`No command specified.`, "E_NO_COMMAND");
      }
    }
    if (typeof cmd.run === "function")
      result = await cmd.run(context);
  } catch (error) {
    runError = error;
  }
  const cleanupErrors = [];
  if (typeof cmd.cleanup === "function")
    try {
      await cmd.cleanup(context);
    } catch (error) {
      cleanupErrors.push(error);
    }
  for (const plugin of [...plugins].reverse())
    try {
      await plugin.cleanup?.(context);
    } catch (error) {
      cleanupErrors.push(error);
    }
  if (runError)
    throw runError;
  if (cleanupErrors.length === 1)
    throw cleanupErrors[0];
  if (cleanupErrors.length > 1)
    throw new Error("Multiple cleanup errors", { cause: cleanupErrors });
  return { result };
}
async function resolveSubCommand(cmd, rawArgs, parent) {
  const subCommands = await resolveValue(cmd.subCommands);
  if (subCommands && Object.keys(subCommands).length > 0) {
    const subCommandArgIndex = findSubCommandIndex(rawArgs, await resolveValue(cmd.args || {}));
    const subCommandName = rawArgs[subCommandArgIndex];
    const subCommand = await _findSubCommand(subCommands, subCommandName);
    if (subCommand)
      return resolveSubCommand(subCommand, rawArgs.slice(subCommandArgIndex + 1), cmd);
  }
  return [cmd, parent];
}
async function _findSubCommand(subCommands, name) {
  if (name in subCommands)
    return resolveValue(subCommands[name]);
  for (const sub of Object.values(subCommands)) {
    const resolved = await resolveValue(sub);
    const meta = await resolveValue(resolved?.meta);
    if (meta?.alias) {
      if (toArray(meta.alias).includes(name))
        return resolved;
    }
  }
}
function findSubCommandIndex(rawArgs, argsDef) {
  for (let i = 0;i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === "--")
      return -1;
    if (arg.startsWith("-")) {
      if (!arg.includes("=") && _isValueFlag(arg, argsDef))
        i++;
      continue;
    }
    return i;
  }
  return -1;
}
function _isValueFlag(flag, argsDef) {
  const name = flag.replace(/^-{1,2}/, "");
  const normalized = camelCase(name);
  for (const [key, def] of Object.entries(argsDef)) {
    if (def.type !== "string" && def.type !== "enum")
      continue;
    if (normalized === camelCase(key))
      return true;
    if ((Array.isArray(def.alias) ? def.alias : def.alias ? [def.alias] : []).includes(name))
      return true;
  }
  return false;
}
async function showUsage(cmd, parent) {
  try {
    console.log(await renderUsage(cmd, parent) + `
`);
  } catch (error) {
    console.error(error);
  }
}
var negativePrefixRe = /^no[-A-Z]/;
async function renderUsage(cmd, parent) {
  const cmdMeta = await resolveValue(cmd.meta || {});
  const cmdArgs = resolveArgs(await resolveValue(cmd.args || {}));
  const parentMeta = await resolveValue(parent?.meta || {});
  const commandName = `${parentMeta.name ? `${parentMeta.name} ` : ""}` + (cmdMeta.name || process.argv[1]);
  const argLines = [];
  const posLines = [];
  const commandsLines = [];
  const usageLine = [];
  for (const arg of cmdArgs)
    if (arg.type === "positional") {
      const name = arg.name.toUpperCase();
      const isRequired = arg.required !== false && arg.default === undefined;
      posLines.push([cyan(name + renderValueHint(arg)), renderDescription(arg, isRequired)]);
      usageLine.push(isRequired ? `<${name}>` : `[${name}]`);
    } else {
      const isRequired = arg.required === true && arg.default === undefined;
      const argStr = [...(arg.alias || []).map((a) => `-${a}`), `--${arg.name}`].join(", ") + renderValueHint(arg);
      argLines.push([cyan(argStr), renderDescription(arg, isRequired)]);
      if (arg.type === "boolean" && (arg.default === true || arg.negativeDescription) && !negativePrefixRe.test(arg.name)) {
        const negativeArgStr = [...(arg.alias || []).map((a) => `--no-${a}`), `--no-${arg.name}`].join(", ");
        argLines.push([cyan(negativeArgStr), [arg.negativeDescription, isRequired ? gray("(Required)") : ""].filter(Boolean).join(" ")]);
      }
      if (isRequired)
        usageLine.push(`--${arg.name}` + renderValueHint(arg));
    }
  if (cmd.subCommands) {
    const commandNames = [];
    const subCommands = await resolveValue(cmd.subCommands);
    for (const [name, sub] of Object.entries(subCommands)) {
      const meta = await resolveValue((await resolveValue(sub))?.meta);
      if (meta?.hidden)
        continue;
      const aliases = toArray(meta?.alias);
      const label = [name, ...aliases].join(", ");
      commandsLines.push([cyan(label), meta?.description || ""]);
      commandNames.push(name, ...aliases);
    }
    usageLine.push(commandNames.join("|"));
  }
  const usageLines = [];
  const version = cmdMeta.version || parentMeta.version;
  usageLines.push(gray(`${cmdMeta.description} (${commandName + (version ? ` v${version}` : "")})`), "");
  const hasOptions = argLines.length > 0 || posLines.length > 0;
  usageLines.push(`${underline(bold("USAGE"))} ${cyan(`${commandName}${hasOptions ? " [OPTIONS]" : ""} ${usageLine.join(" ")}`)}`, "");
  if (posLines.length > 0) {
    usageLines.push(underline(bold("ARGUMENTS")), "");
    usageLines.push(formatLineColumns(posLines, "  "));
    usageLines.push("");
  }
  if (argLines.length > 0) {
    usageLines.push(underline(bold("OPTIONS")), "");
    usageLines.push(formatLineColumns(argLines, "  "));
    usageLines.push("");
  }
  if (commandsLines.length > 0) {
    usageLines.push(underline(bold("COMMANDS")), "");
    usageLines.push(formatLineColumns(commandsLines, "  "));
    usageLines.push("", `Use ${cyan(`${commandName} <command> --help`)} for more information about a command.`);
  }
  return usageLines.filter((l) => typeof l === "string").join(`
`);
}
function renderValueHint(arg) {
  const valueHint = arg.valueHint ? `=<${arg.valueHint}>` : "";
  const fallbackValueHint = valueHint || `=<${snakeCase(arg.name)}>`;
  if (!arg.type || arg.type === "positional" || arg.type === "boolean")
    return valueHint;
  if (arg.type === "enum" && arg.options?.length)
    return `=<${arg.options.join("|")}>`;
  return fallbackValueHint;
}
function renderDescription(arg, required) {
  const requiredHint = required ? gray("(Required)") : "";
  const defaultHint = arg.default === undefined ? "" : gray(`(Default: ${arg.default})`);
  return [
    arg.description,
    requiredHint,
    defaultHint
  ].filter(Boolean).join(" ");
}
async function runMain(cmd, opts = {}) {
  const rawArgs = opts.rawArgs || process.argv.slice(2);
  const showUsage$1 = opts.showUsage || showUsage;
  try {
    const builtinFlags = await _resolveBuiltinFlags(cmd);
    if (builtinFlags.help.length > 0 && rawArgs.some((arg) => builtinFlags.help.includes(arg))) {
      await showUsage$1(...await resolveSubCommand(cmd, rawArgs));
      process.exit(0);
    } else if (rawArgs.length === 1 && builtinFlags.version.includes(rawArgs[0])) {
      const meta = typeof cmd.meta === "function" ? await cmd.meta() : await cmd.meta;
      if (!meta?.version)
        throw new CLIError("No version specified", "E_NO_VERSION");
      console.log(meta.version);
    } else
      await runCommand(cmd, { rawArgs });
  } catch (error) {
    if (error instanceof CLIError) {
      await showUsage$1(...await resolveSubCommand(cmd, rawArgs));
      console.error(error.message);
    } else
      console.error(error, `
`);
    process.exit(1);
  }
}
async function _resolveBuiltinFlags(cmd) {
  const argsDef = await resolveValue(cmd.args || {});
  const userNames = /* @__PURE__ */ new Set;
  const userAliases = /* @__PURE__ */ new Set;
  for (const [name, def] of Object.entries(argsDef)) {
    userNames.add(name);
    for (const alias of toArray(def.alias))
      userAliases.add(alias);
  }
  return {
    help: _getBuiltinFlags("help", "h", userNames, userAliases),
    version: _getBuiltinFlags("version", "v", userNames, userAliases)
  };
}
function _getBuiltinFlags(long, short, userNames, userAliases) {
  if (userNames.has(long) || userAliases.has(long))
    return [];
  if (userNames.has(short) || userAliases.has(short))
    return [`--${long}`];
  return [`--${long}`, `-${short}`];
}

// packages/quantize-io-hooks/src/activate.ts
import { unlinkSync } from "fs";

// packages/quantize-io-core/dist/detect.js
var COMPRESSIBLE_EXTENSIONS = new Set([
  ".md",
  ".txt",
  ".markdown",
  ".rst"
]);
var SKIP_EXTENSIONS = new Set([
  ".py",
  ".js",
  ".ts",
  ".tsx",
  ".jsx",
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".env",
  ".lock",
  ".css",
  ".scss",
  ".html",
  ".xml",
  ".sql",
  ".sh",
  ".bash",
  ".zsh",
  ".go",
  ".rs",
  ".java",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".rb",
  ".php",
  ".swift",
  ".kt",
  ".lua",
  ".dockerfile",
  ".makefile",
  ".csv",
  ".ini",
  ".cfg"
]);
var CONFIG_EXTS = new Set([
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".ini",
  ".cfg",
  ".env"
]);
// packages/quantize-io-core/dist/sensitive.js
var SENSITIVE_PATH_COMPONENTS = new Set([
  ".ssh",
  ".aws",
  ".gnupg",
  ".kube",
  ".docker"
]);
// packages/quantize-io-core/dist/safe-io.js
import { constants, closeSync, fchmodSync, lstatSync, mkdirSync, openSync, readSync, renameSync, writeSync } from "fs";
import { Buffer as Buffer2 } from "buffer";
import { dirname, join } from "path";
var MAX_FLAG_BYTES = 64;
function nofollowFlag() {
  const c = constants;
  return typeof c.O_NOFOLLOW === "number" ? c.O_NOFOLLOW : 0;
}
function safeWriteFlag(flagPath, content) {
  try {
    const flagDir = dirname(flagPath);
    mkdirSync(flagDir, { recursive: true });
    try {
      if (lstatSync(flagDir).isSymbolicLink())
        return;
    } catch {
      return;
    }
    try {
      if (lstatSync(flagPath).isSymbolicLink())
        return;
    } catch (e) {
      const err = e;
      if (err.code !== "ENOENT")
        return;
    }
    const tempPath = join(flagDir, `.quantize-flag.${process.pid}.${Date.now()}`);
    const flags = constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | nofollowFlag();
    let fd;
    try {
      fd = openSync(tempPath, flags, 384);
      writeSync(fd, String(content));
      try {
        fchmodSync(fd, 384);
      } catch {}
    } finally {
      if (fd !== undefined)
        closeSync(fd);
    }
    renameSync(tempPath, flagPath);
  } catch {}
}
function readFlag(flagPath, whitelist) {
  try {
    let st;
    try {
      st = lstatSync(flagPath);
    } catch {
      return null;
    }
    if (st.isSymbolicLink() || !st.isFile())
      return null;
    if (st.size > MAX_FLAG_BYTES)
      return null;
    const flags = constants.O_RDONLY | nofollowFlag();
    let fd;
    let out;
    try {
      fd = openSync(flagPath, flags);
      const buf = Buffer2.alloc(MAX_FLAG_BYTES);
      const n = readSync(fd, buf, 0, MAX_FLAG_BYTES, 0);
      out = buf.subarray(0, n).toString("utf8");
    } finally {
      if (fd !== undefined)
        closeSync(fd);
    }
    const raw = out.trim().toLowerCase();
    if (!whitelist.includes(raw))
      return null;
    return raw;
  } catch {
    return null;
  }
}
// packages/quantize-io-core/dist/rules.embedded.js
var RULES_MD_RAW = `# quantize-io response-mode rules

> Bundled with \`@quantize-io/core\`. Loaded by \`@quantize-io/hooks\` at SessionStart and reinforced per turn by UserPromptSubmit.

## Response Modes

| Mode | Character | Tone | Token pressure |
|------|-----------|------|----------------|
| off | default host behavior | natural | none |
| lite | concise | factual | low |
| full | compressed | dense | medium |
| ultra | maximum compression | terse | high |
| wenyan-lite | bullet-first | minimal prose | low |
| wenyan | bullet-first + short prose | dense | medium |
| wenyan-full | bullet-first + no prose | dense | high |
| wenyan-ultra | bullet-only | telegraphic | maximum |
| commit | subject + body | imperative | low |
| review | structured findings | analytic | medium |
| compress | raw markdown compression | literal | high |

## Rules per mode

- off: no extra rules.
- lite: prefer short sentences; avoid repetition; keep every preserved token value.
- full: drop filler words; use tables for enumerations; preserve code/URLs/paths/headings exactly.
- ultra: sentence fragments allowed; aggressive abbreviation; never drop a numerical value, code block, URL, path, or heading.
- wenyan-lite: lead with bullets; short prose only between related bullets.
- wenyan: lead with bullets; prose as connective tissue only.
- wenyan-full: bullets only; no connective prose.
- wenyan-ultra: telegraphic bullets; drop articles and auxiliaries.
- commit: subject <=50 chars imperative; body wraps at 72; explain why.
- review: finding -> evidence -> severity -> fix.
- compress: no commentary; return only the compressed body.

## Preservation invariants (all modes)

- Code blocks and inline backticks: identical bytes.
- URLs, file paths, shell commands: identical bytes.
- Headings: same count, level, and text.
- Numerical values and named entities: unchanged.

## Enforcement

Every turn, the active mode is rechecked from \`~/.quantize/active-mode\`. If the flag file is missing or holds an unknown value, mode is \`off\`.
`;

// packages/quantize-io-core/dist/rules.js
var VALID_MODES = [
  "off",
  "lite",
  "full",
  "ultra",
  "wenyan-lite",
  "wenyan",
  "wenyan-full",
  "wenyan-ultra",
  "commit",
  "review",
  "compress"
];
function isValidMode(value) {
  return VALID_MODES.includes(value);
}
function loadRawRules() {
  return RULES_MD_RAW;
}
function filterRulesByMode(mode, raw = loadRawRules()) {
  const lines = raw.split(`
`);
  const out = [];
  let section = "preamble";
  for (const line of lines) {
    if (line.startsWith("## Response Modes")) {
      section = "mode-table";
      out.push(line);
      continue;
    }
    if (line.startsWith("## Rules per mode")) {
      section = "rules";
      out.push(line);
      continue;
    }
    if (line.startsWith("## Preservation invariants")) {
      section = "invariants";
      out.push(line);
      continue;
    }
    if (line.startsWith("## Enforcement")) {
      section = "enforcement";
      out.push(line);
      continue;
    }
    if (section === "mode-table") {
      if (line.startsWith("| Mode") || line.startsWith("|------") || line === "" || line.startsWith(`| ${mode} `)) {
        out.push(line);
      }
      continue;
    }
    if (section === "rules") {
      if (line.startsWith(`- ${mode}:`) || line === "") {
        out.push(line);
      }
      continue;
    }
    out.push(line);
  }
  return out.join(`
`).replace(/\n{3,}/g, `

`).trimEnd() + `
`;
}
// packages/quantize-io-core/dist/cache.js
import { homedir } from "os";
import { join as join2 } from "path";
var DEFAULT_CACHE_ROOT = join2(homedir(), ".quantize", "cache");
// packages/quantize-io-hooks/src/paths.ts
import { homedir as homedir2 } from "os";
import { join as join3 } from "path";
function quantizeRoot() {
  return join3(homedir2(), ".quantize");
}
function flagPath() {
  return join3(quantizeRoot(), "active-mode");
}

// packages/quantize-io-hooks/src/activate.ts
var INDEPENDENT_MODES = new Set(["commit", "review", "compress"]);
function resolveDefaultMode() {
  const envValue = (process.env["QT_DEFAULT_MODE"] ?? "").toLowerCase();
  if (envValue && isValidMode(envValue))
    return envValue;
  return "full";
}
function runActivate(opts = {}) {
  const mode = opts.mode ?? resolveDefaultMode();
  const flag = flagPath();
  if (mode === "off") {
    try {
      unlinkSync(flag);
    } catch {}
    return { mode, skipped: true, stdout: "OK" };
  }
  safeWriteFlag(flag, mode);
  if (INDEPENDENT_MODES.has(mode)) {
    const banner = `quantize-io MODE ACTIVE \u2014 level: ${mode}. Behavior defined by /qt-${mode} skill.`;
    return { mode, skipped: false, stdout: banner };
  }
  const filtered = filterRulesByMode(mode);
  const stdout = `quantize-io MODE ACTIVE \u2014 level: ${mode}

${filtered}`;
  return { mode, skipped: false, stdout };
}

// packages/quantize-io-hooks/src/track.ts
import { unlinkSync as unlinkSync2 } from "fs";
var INDEPENDENT_MODES2 = new Set(["commit", "review", "compress"]);
var ACTIVATE_RE = /\b(activate|enable|turn on|start|talk like)\b.*\bquantize-io\b/i;
var ACTIVATE_POST_RE = /\bquantize-io\b.*\b(mode|activate|enable|turn on|start)\b/i;
var DEACTIVATE_RE = /\b(stop|disable|deactivate|turn off)\b.*\bquantize-io\b/i;
var DEACTIVATE_POST_RE = /\bquantize-io\b.*\b(stop|disable|deactivate|turn off)\b/i;
var NORMAL_MODE_RE = /\bnormal mode\b/i;
function parseSlash(prompt) {
  const trimmed = prompt.trim().toLowerCase();
  if (!trimmed.startsWith("/qt"))
    return null;
  const parts = trimmed.split(/\s+/);
  const cmd = parts[0] ?? "";
  const arg = parts[1] ?? "";
  switch (cmd) {
    case "/qt-commit":
      return "commit";
    case "/qt-review":
      return "review";
    case "/qt-compress":
      return "compress";
    case "/qt": {
      if (arg && isValidMode(arg))
        return arg;
      return "full";
    }
    default:
      return null;
  }
}
function isDeactivation(prompt) {
  return DEACTIVATE_RE.test(prompt) || DEACTIVATE_POST_RE.test(prompt) || NORMAL_MODE_RE.test(prompt);
}
function isNaturalActivation(prompt) {
  if (!ACTIVATE_RE.test(prompt) && !ACTIVATE_POST_RE.test(prompt))
    return false;
  return !isDeactivation(prompt);
}
function runTrack(input) {
  const prompt = input.prompt ?? "";
  const flag = flagPath();
  if (isDeactivation(prompt)) {
    try {
      unlinkSync2(flag);
    } catch {}
    return { modeAfter: null, stdout: "" };
  }
  const slashMode = parseSlash(prompt);
  if (slashMode) {
    if (slashMode === "off") {
      try {
        unlinkSync2(flag);
      } catch {}
    } else {
      safeWriteFlag(flag, slashMode);
    }
  } else if (isNaturalActivation(prompt)) {
    safeWriteFlag(flag, "full");
  }
  const active = readFlag(flag, [...VALID_MODES]);
  if (!active || !isValidMode(active) || INDEPENDENT_MODES2.has(active)) {
    return { modeAfter: active, stdout: "" };
  }
  const payload = {
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: `quantize-io MODE ACTIVE (${active}). ` + "Drop articles/filler/pleasantries/hedging. Fragments OK. " + "Code/commits/security: write normal."
    }
  };
  return { modeAfter: active, stdout: JSON.stringify(payload) };
}
async function readStdin() {
  let buf = "";
  for await (const chunk of process.stdin) {
    buf += chunk;
  }
  return buf;
}

// packages/quantize-io-hooks/src/statusline.ts
var ORANGE = "\x1B[38;5;172m";
var RESET = "\x1B[0m";
function renderStatusline() {
  const mode = readFlag(flagPath(), [...VALID_MODES]);
  if (!mode || !isValidMode(mode) || mode === "off")
    return "";
  if (mode === "full")
    return `${ORANGE}[QT]${RESET}`;
  return `${ORANGE}[QT:${mode.toUpperCase()}]${RESET}`;
}

// packages/quantize-io-hooks/src/index.ts
var activate = defineCommand({
  meta: { name: "activate", description: "SessionStart activation hook." },
  async run() {
    const result = runActivate();
    process.stdout.write(result.stdout);
  }
});
var track = defineCommand({
  meta: { name: "track", description: "UserPromptSubmit mode tracker hook." },
  async run() {
    try {
      const raw = await readStdin();
      const data = JSON.parse(raw);
      const result = runTrack({ prompt: data.prompt ?? "" });
      if (result.stdout)
        process.stdout.write(result.stdout);
    } catch {}
  }
});
var statusline = defineCommand({
  meta: { name: "statusline", description: "Render Claude Code statusline badge." },
  run() {
    const out = renderStatusline();
    if (out)
      process.stdout.write(out);
  }
});
var main = defineCommand({
  meta: {
    name: "@quantize-io/hooks",
    version: "0.1.0",
    description: "Host hooks for Claude Code / Codex (SessionStart + UserPromptSubmit + statusline)."
  },
  subCommands: { activate, track, statusline }
});
runMain(main);
