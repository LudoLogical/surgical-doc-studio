import type { BlockKind, SdsBlock } from "./types";
import { newSdsBlockId } from "./parse";

export function createEmptyBlock(kind: BlockKind = "paragraph"): SdsBlock {
  return {
    id: newSdsBlockId(),
    kind,
    text: "",
    verified: false,
  };
}

/** Fresh ids and cleared verification — for paste / duplicate. */
export function cloneBlocksForPaste(blocks: SdsBlock[]): SdsBlock[] {
  return blocks.map((b) => ({
    ...b,
    id: newSdsBlockId(),
    verified: false,
    verifiedAt: undefined,
    verifiedBy: undefined,
  }));
}

/**
 * Move one block from `from` to gap `dropIndex` (0 = before first, length = after last).
 */
export function moveBlockToGap(
  arr: SdsBlock[],
  from: number,
  dropIndex: number,
): SdsBlock[] {
  const n = arr.length;
  if (from < 0 || from >= n || dropIndex < 0 || dropIndex > n) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  let insertAt = dropIndex;
  if (from < dropIndex) insertAt = dropIndex - 1;
  next.splice(insertAt, 0, item);
  return next;
}

export function insertBlocksAt(
  arr: SdsBlock[],
  atIndex: number,
  toInsert: SdsBlock[],
): SdsBlock[] {
  const next = [...arr];
  next.splice(atIndex, 0, ...toInsert);
  return next;
}
