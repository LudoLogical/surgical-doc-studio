import type { BlockKind, SdsBlock } from "./types";

const LIST_LINE = /^\s*(?:[-*+]|\d+\.)\s+/;

export function newSdsBlockId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function newId(): string {
  return newSdsBlockId();
}

/** Classify a non-empty segment (possibly multi-line) */
function classifySegment(raw: string): { kind: BlockKind; text: string } {
  const lines = raw.split("\n");
  const first = lines[0] ?? "";

  if (/^#{1,6}\s/.test(first)) {
    return { kind: "header", text: raw.trimEnd() };
  }

  const nonEmpty = lines.filter((l) => l.trim() !== "");
  if (
    nonEmpty.length > 0 &&
    nonEmpty.every((l) => LIST_LINE.test(l) || /^\s{2,}\S/.test(l))
  ) {
    const allListLike = nonEmpty.every(
      (l) => LIST_LINE.test(l) || /^\s{2,}\S/.test(l),
    );
    if (allListLike) {
      return { kind: "list", text: raw.trimEnd() };
    }
  }

  if (nonEmpty.length > 0 && nonEmpty.every((l) => LIST_LINE.test(l))) {
    return { kind: "list", text: raw.trimEnd() };
  }

  return { kind: "paragraph", text: raw.trimEnd() };
}

/**
 * Parse Markdown-like source into headers, paragraphs, and list blocks.
 */
export function parseDocumentToBlocks(source: string): Omit<SdsBlock, "verified">[] {
  const normalized = source.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const lines = normalized.split("\n");
  const blocks: Omit<SdsBlock, "verified">[] = [];
  let i = 0;

  while (i < lines.length) {
    if (lines[i].trim() === "") {
      i++;
      continue;
    }

    const start = i;
    const line = lines[i];

    if (/^#{1,6}\s/.test(line)) {
      blocks.push({ id: newId(), kind: "header", text: line.trimEnd() });
      i++;
      continue;
    }

    if (LIST_LINE.test(line)) {
      i++;
      while (i < lines.length) {
        const L = lines[i];
        if (L.trim() === "") break;
        if (/^#{1,6}\s/.test(L)) break;
        if (LIST_LINE.test(L)) {
          i++;
          continue;
        }
        if (/^\s{2,}\S/.test(L)) {
          i++;
          continue;
        }
        break;
      }
      const text = lines.slice(start, i).join("\n").trimEnd();
      blocks.push({ id: newId(), kind: "list", text });
      continue;
    }

    i++;
    while (i < lines.length) {
      const L = lines[i];
      if (L.trim() === "") break;
      if (/^#{1,6}\s/.test(L)) break;
      if (LIST_LINE.test(L)) break;
      i++;
    }
    const segment = lines.slice(start, i).join("\n");
    const { kind, text } = classifySegment(segment);
    blocks.push({ id: newId(), kind, text });
  }

  return blocks;
}

export function blocksToMarkdown(blocks: Pick<SdsBlock, "text">[]): string {
  return blocks.map((b) => b.text).join("\n\n");
}
