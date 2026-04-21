#!/usr/bin/env python3
"""
CELLM CLI context quantizer.

Implements a Compress-LLM-style pipeline for hook context payloads:
1) detect (text profile: natural-language vs structured/code-heavy)
2) compress (deterministic, structure-preserving)
3) validate (code/url/path + required anchors)
4) fallback (retry conservative pass, then rollback to safe original cap)
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from typing import List, Sequence, Tuple

FENCE_RE = re.compile(r"```[\s\S]*?```|~~~[\s\S]*?~~~")
INLINE_CODE_RE = re.compile(r"`[^`\n]+`")
URL_RE = re.compile(r"https?://[^\s)]+")
PATH_RE = re.compile(r"(?:\./|\.\./|/|[A-Za-z]:\\)[\w\-./\\]+|[\w\-\.]+[/\\][\w\-./\\]+")
XML_TAG_RE = re.compile(r"</?[a-zA-Z][^>\n]{0,120}>")

CODE_LINE_PATTERNS = [
    re.compile(r"^\s*(import |from .+ import |require\(|const |let |var )"),
    re.compile(r"^\s*(def |class |function |async function |export )"),
    re.compile(r"^\s*(if\s*\(|for\s*\(|while\s*\(|switch\s*\(|try\s*\{)"),
    re.compile(r"^\s*[\}\]\);]+\s*$"),
    re.compile(r"^\s*@\w+"),
    re.compile(r'^\s*"[^"]+"\s*:\s*'),
]

PLEASANTRY_PREFIX = re.compile(
    r"^\s*(sure|certainly|of course|absolutely|happy to help|i(?:'| a)m happy to help)\b[!,.\s-]*",
    re.IGNORECASE,
)
FILLER_WORDS = re.compile(
    r"\b(just|really|basically|actually|simply|essentially|generally|clearly|obviously|literally)\b",
    re.IGNORECASE,
)
PHRASE_RULES: Sequence[Tuple[re.Pattern[str], str]] = [
    (re.compile(r"\bin order to\b", re.IGNORECASE), "to"),
    (re.compile(r"\bmake sure to\b", re.IGNORECASE), "ensure"),
    (re.compile(r"\bit might be worth\b", re.IGNORECASE), ""),
    (re.compile(r"\byou could consider\b", re.IGNORECASE), "consider"),
    (re.compile(r"\bthe reason is because\b", re.IGNORECASE), "because"),
    (re.compile(r"\bfurthermore\b", re.IGNORECASE), ""),
    (re.compile(r"\badditionally\b", re.IGNORECASE), ""),
    (re.compile(r"\bin addition\b", re.IGNORECASE), ""),
]
LOW_SIGNAL_LINE_RE = re.compile(
    r"\b(let me know|if you want|if needed|in summary|overall|to wrap up|thanks)\b",
    re.IGNORECASE,
)
PRIORITY_KEYWORD_RE = re.compile(
    r"\b(error|fail|warning|risk|fix|next|action|contract|signal|constraint|must|security)\b",
    re.IGNORECASE,
)

MAX_PLACEHOLDER_SCAN = 100_000


@dataclass
class TextProfile:
    structured: bool


def code_line_ratio(text: str) -> float:
    lines = text.splitlines()[:300]
    non_empty = [ln for ln in lines if ln.strip()]
    if not non_empty:
        return 0.0
    hits = 0
    for ln in non_empty:
        if any(p.match(ln) for p in CODE_LINE_PATTERNS):
            hits += 1
    return hits / max(1, len(non_empty))


def detect_profile(text: str) -> TextProfile:
    ratio = code_line_ratio(text)
    structured = ratio >= 0.4
    return TextProfile(structured=structured)


def protect_segments(text: str) -> tuple[str, list[str]]:
    protected = text
    bag: list[str] = []
    patterns = [FENCE_RE, INLINE_CODE_RE, URL_RE, PATH_RE, XML_TAG_RE]

    for pat in patterns:
        def repl(match: re.Match[str]) -> str:
            idx = len(bag)
            bag.append(match.group(0))
            return f"__CELLM_QZ_{idx}__"

        protected = pat.sub(repl, protected)

    return protected, bag


def restore_segments(text: str, bag: Sequence[str]) -> str:
    def repl(match: re.Match[str]) -> str:
        idx = int(match.group(1))
        if 0 <= idx < len(bag):
            return bag[idx]
        return ""

    return re.sub(r"__CELLM_QZ_(\d+)__", repl, text)


def normalize_whitespace(text: str) -> str:
    out = text.replace("\r\n", "\n").replace("\r", "\n")
    out = "\n".join(line.rstrip(" \t") for line in out.split("\n"))
    out = re.sub(r"\n{3,}", "\n\n", out)
    return out


def dedupe_lines(text: str) -> str:
    seen: set[str] = set()
    out: list[str] = []
    for line in text.split("\n"):
        if not line.strip():
            out.append("")
            continue
        key = re.sub(r"\s+", " ", line.strip().lower())
        key = re.sub(r"[`*_>#-]", "", key)
        if len(key) >= 16:
            if key in seen:
                continue
            seen.add(key)
        out.append(line)
    return re.sub(r"\n{3,}", "\n\n", "\n".join(out))


def compress_aggressive(text: str) -> str:
    out = text
    out = PLEASANTRY_PREFIX.sub("", out)
    for pat, repl in PHRASE_RULES:
        out = pat.sub(repl, out)
    out = FILLER_WORDS.sub("", out)
    out = re.sub(r"[ \t]{2,}", " ", out)
    out = re.sub(r"[ ]+([,.;:!?])", r"\1", out)
    out = re.sub(r"\n[ \t]+", "\n", out)
    out = dedupe_lines(out)
    out = normalize_whitespace(out)
    return out


def compress_conservative(text: str) -> str:
    out = text
    out = re.sub(r"[ \t]{2,}", " ", out)
    out = re.sub(r"[ ]+([,.;:!?])", r"\1", out)
    out = normalize_whitespace(out)
    return out


def mode_target_ratio(mode: str) -> float:
    if mode == "compact":
        return 0.60
    if mode == "standard":
        return 0.75
    return 0.92


def should_apply_block_budget(mode: str, text_len: int) -> bool:
    if mode == "compact":
        return text_len >= 900
    if mode == "standard":
        return text_len >= 1300
    return text_len >= 2200


def block_priority(block: str, idx: int, must_keep: Sequence[str]) -> int:
    score = 0
    trimmed = block.strip()
    if not trimmed:
        return -100
    if idx == 0:
        score += 20
    if any(anchor and anchor in block for anchor in must_keep):
        score += 200
    if "__CELLM_QZ_" in block:
        score += 120
    if re.search(r"^\s{0,3}#{1,6}\s", block, re.MULTILINE):
        score += 90
    if re.search(r"^\s*(?:[-*]|\d+\.)\s", block, re.MULTILINE):
        score += 60
    if PRIORITY_KEYWORD_RE.search(block):
        score += 40
    if LOW_SIGNAL_LINE_RE.search(block):
        score -= 15
    return score


def shrink_blocks(text: str, target_chars: int, must_keep: Sequence[str]) -> str:
    if target_chars <= 0 or len(text) <= target_chars:
        return text

    blocks = [b for b in text.split("\n\n") if b.strip()]
    if len(blocks) <= 1:
        return text

    scores = [block_priority(block, idx, must_keep) for idx, block in enumerate(blocks)]

    keep: set[int] = set()
    # Keep first block and mandatory anchor-bearing blocks.
    keep.add(0)
    for idx, score in enumerate(scores):
        if score >= 180:
            keep.add(idx)

    def render(indices: Sequence[int]) -> str:
        chosen = [blocks[i].strip() for i in sorted(indices)]
        return "\n\n".join(chosen).strip()

    out = render(keep)
    if len(out) >= target_chars and len(keep) > 1:
        return out

    remaining = sorted(
        [i for i in range(len(blocks)) if i not in keep],
        key=lambda i: (scores[i], -i),
        reverse=True,
    )
    for idx in remaining:
        candidate = render([*keep, idx])
        if len(candidate) <= target_chars:
            keep.add(idx)
            out = candidate
            continue
        # Keep a small headroom breach for high-priority blocks.
        if scores[idx] >= 90 and len(candidate) <= int(target_chars * 1.10):
            keep.add(idx)
            out = candidate
        break

    return out if out else text


def cap_at_boundary(text: str, max_chars: int) -> str:
    if max_chars <= 0 or len(text) <= max_chars:
        return text
    cap = max(32, max_chars - 3)
    cut = text[:cap]

    last_break = cut.rfind("\n")
    if last_break > cap * 0.85:
        cut = cut[:last_break]

    last_space = cut.rfind(" ")
    if last_space > len(cut) * 0.75:
        cut = cut[:last_space]

    return cut.rstrip(" \t\n") + "..."


def extract_set(pat: re.Pattern[str], text: str) -> set[str]:
    return set(pat.findall(text))


def validate_output(original: str, candidate: str, must_keep: Sequence[str]) -> bool:
    # Keep explicit required anchors when present in original.
    for anchor in must_keep:
        if anchor and anchor in original and anchor not in candidate:
            return False

    # Protected structures must not disappear when they existed pre-quantization.
    for pat in (URL_RE,):
        src = extract_set(pat, original[:MAX_PLACEHOLDER_SCAN])
        dst = extract_set(pat, candidate[:MAX_PLACEHOLDER_SCAN])
        if src and not src.issubset(dst):
            return False

    # Fenced code blocks should survive intact if they were present.
    src_blocks = FENCE_RE.findall(original[:MAX_PLACEHOLDER_SCAN])
    if src_blocks:
        for block in src_blocks:
            if block not in candidate:
                return False

    return True


def quantize_text(text: str, mode: str, max_chars: int, must_keep: Sequence[str]) -> str:
    profile = detect_profile(text)
    normalized = normalize_whitespace(text)

    protected, bag = protect_segments(normalized)

    target_chars = min(max_chars, int(len(normalized) * mode_target_ratio(mode)))

    # Attempt 1: mode-aware compression.
    if profile.structured:
        attempt1 = compress_conservative(protected)
    else:
        attempt1 = compress_aggressive(protected) if mode == "compact" else compress_conservative(protected)
    out1 = restore_segments(attempt1, bag)
    if should_apply_block_budget(mode, len(normalized)):
        out1 = shrink_blocks(out1, target_chars, must_keep)
    out1 = cap_at_boundary(out1, max_chars)
    if validate_output(normalized, out1, must_keep):
        return out1

    # Attempt 2: conservative retry (Compress-LLM-style targeted fallback).
    attempt2 = compress_conservative(protected)
    out2 = cap_at_boundary(restore_segments(attempt2, bag), max_chars)
    if validate_output(normalized, out2, must_keep):
        return out2

    # Rollback: safe original capped.
    return cap_at_boundary(normalized, max_chars)


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--mode", default="standard")
    parser.add_argument("--max-chars", type=int, default=1200)
    parser.add_argument("--must-keep", action="append", default=[])
    return parser.parse_args(argv)


def main(argv: Sequence[str]) -> int:
    args = parse_args(argv)
    src = sys.stdin.read()
    if not src:
        return 0

    mode = str(args.mode).strip().lower()
    if mode not in {"compact", "standard", "comprehensive"}:
        mode = "standard"

    max_chars = int(args.max_chars) if isinstance(args.max_chars, int) else 1200
    max_chars = max(300, min(100000, max_chars))
    must_keep = [m for m in (args.must_keep or []) if isinstance(m, str) and m.strip()]

    try:
        out = quantize_text(src, mode, max_chars, must_keep)
    except Exception:
        out = cap_at_boundary(normalize_whitespace(src), max_chars)

    sys.stdout.write(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
