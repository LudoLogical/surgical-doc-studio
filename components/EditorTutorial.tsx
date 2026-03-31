"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { RefObject } from "react";
import { X } from "lucide-react";

export type EditorTutorialStep = {
  title: string;
  description: string;
  targetRef: RefObject<HTMLElement | null>;
};

type Props = {
  open: boolean;
  steps: readonly EditorTutorialStep[];
  stepIndex: number;
  onStepIndexChange: (i: number) => void;
  onSkip: () => void;
  onComplete: () => void;
};

const PAD = 10;
const CARD_MIN_W = 280;
const CARD_MAX_W = 400;
const CARD_PAD_X = 24;
const CARD_GAP = 16;
const CARD_EST_H = 300;

type LayoutState = {
  frame: { top: number; left: number; width: number; height: number };
  cardTop: number;
  cardLeft: number;
  cardWidth: number;
};

/** Dims only the viewport *outside* `frame` — no overlay on the hole so content stays clear. */
function SpotlightScrim({ frame }: { frame: LayoutState["frame"] }) {
  const t = frame.top;
  const l = frame.left;
  const h = frame.height;
  const b = t + h;
  const r = l + frame.width;

  const scrim =
    "fixed z-[204] bg-slate-950/55 backdrop-blur-[1.5px] pointer-events-auto";

  return (
    <>
      <div className={scrim} style={{ top: 0, left: 0, right: 0, height: t }} aria-hidden />
      <div className={scrim} style={{ top: b, left: 0, right: 0, bottom: 0 }} aria-hidden />
      <div className={scrim} style={{ top: t, left: 0, width: l, height: h }} aria-hidden />
      <div className={scrim} style={{ top: t, left: r, right: 0, height: h }} aria-hidden />
    </>
  );
}

export function EditorTutorial({
  open,
  steps,
  stepIndex,
  onStepIndexChange,
  onSkip,
  onComplete,
}: Props) {
  const [layout, setLayout] = useState<LayoutState | null>(null);
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const recompute = useCallback(() => {
    if (typeof window === "undefined" || !open || steps.length === 0) {
      setLayout(null);
      return;
    }
    const i = Math.min(Math.max(0, stepIndex), steps.length - 1);
    const el = steps[i].targetRef.current;
    if (!el) {
      setLayout(null);
      return;
    }
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    const r = el.getBoundingClientRect();
    const frame = {
      top: r.top - PAD,
      left: r.left - PAD,
      width: r.width + 2 * PAD,
      height: r.height + 2 * PAD,
    };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cardWidth = Math.max(
      CARD_MIN_W,
      Math.min(CARD_MAX_W, vw - CARD_PAD_X),
    );

    const fx = frame.left;
    const fy = frame.top;
    const fw = frame.width;
    const fh = frame.height;
    const frameRight = fx + fw;
    const frameBottom = fy + fh;

    const verticalCenter = () =>
      Math.max(
        CARD_GAP,
        Math.min(fy + fh / 2 - CARD_EST_H / 2, vh - CARD_EST_H - CARD_GAP),
      );

    const clampLeft = (left: number) =>
      Math.max(CARD_GAP, Math.min(left, vw - cardWidth - CARD_GAP));

    const spaceRight = vw - frameRight - CARD_GAP;
    const spaceLeft = fx - CARD_GAP;

    let cardLeft: number;
    let cardTop: number;

    /** Prefer left/right of the highlight so the card never sits on top of it. */
    if (spaceRight >= cardWidth) {
      cardLeft = clampLeft(frameRight + CARD_GAP);
      cardTop = verticalCenter();
    } else if (spaceLeft >= cardWidth) {
      cardLeft = clampLeft(fx - cardWidth - CARD_GAP);
      cardTop = verticalCenter();
    } else {
      cardTop = frameBottom + CARD_GAP;
      if (cardTop + CARD_EST_H > vh - CARD_GAP) {
        cardTop = fy - CARD_EST_H - CARD_GAP;
      }
      cardTop = Math.max(
        CARD_GAP,
        Math.min(cardTop, vh - CARD_EST_H - CARD_GAP),
      );
      cardLeft = clampLeft(fx + fw / 2 - cardWidth / 2);
    }

    setLayout({ frame, cardTop, cardLeft, cardWidth });
  }, [open, stepIndex, steps]);

  useLayoutEffect(() => {
    recompute();
  }, [recompute]);

  useLayoutEffect(() => {
    if (!open) return;
    const onResize = () => recompute();
    window.addEventListener("resize", onResize);
    const raf = requestAnimationFrame(recompute);
    const t1 = window.setTimeout(recompute, 100);
    const t2 = window.setTimeout(recompute, 350);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [open, recompute]);

  if (!open || steps.length === 0 || !mounted) return null;

  const i = Math.min(Math.max(0, stepIndex), steps.length - 1);
  const step = steps[i];
  const isLast = i >= steps.length - 1;

  const fallbackWidth = Math.max(
    CARD_MIN_W,
    Math.min(CARD_MAX_W, typeof window !== "undefined" ? window.innerWidth - CARD_PAD_X : 360),
  );

  const card = (
    <div
      className="fixed inset-0 z-[200]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sds-tutorial-title"
      aria-describedby="sds-tutorial-desc"
      style={{ isolation: "isolate" }}
    >
      {layout ? (
        <SpotlightScrim frame={layout.frame} />
      ) : (
        <div
          className="absolute inset-0 z-[204] bg-slate-950/55 backdrop-blur-[1.5px] pointer-events-auto"
          aria-hidden
        />
      )}
      {layout ? (
        <div
          className="pointer-events-none absolute z-[205] rounded-xl border-2 border-indigo-400 shadow-[0_0_0_4px_rgba(129,140,248,0.3)]"
          style={{
            top: layout.frame.top,
            left: layout.frame.left,
            width: Math.max(layout.frame.width, 8),
            height: Math.max(layout.frame.height, 8),
          }}
        />
      ) : null}
      <div
        className="absolute z-[210] box-border max-h-[min(85vh,380px)] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-4 shadow-2xl pointer-events-auto"
        style={{
          top: layout?.cardTop ?? "auto",
          left: layout?.cardLeft ?? "50%",
          bottom: layout ? undefined : "1.5rem",
          width: layout?.cardWidth ?? fallbackWidth,
          maxWidth: `min(${CARD_MAX_W}px, calc(100vw - ${CARD_PAD_X}px))`,
          minWidth: CARD_MIN_W,
          transform: layout ? undefined : "translateX(-50%)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 flex-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
            Step {i + 1} of {steps.length}
          </p>
          <button
            type="button"
            onClick={onSkip}
            className="shrink-0 rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Skip tutorial"
            title="Skip tutorial"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <h2
          id="sds-tutorial-title"
          className="mt-1 break-words text-base font-semibold leading-snug text-zinc-900"
        >
          {step.title}
        </h2>
        <p
          id="sds-tutorial-desc"
          className="mt-2 break-words text-sm leading-relaxed text-zinc-600"
        >
          {step.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-zinc-100 pt-3">
          <button
            type="button"
            onClick={onSkip}
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
          >
            Skip tutorial
          </button>
          {i > 0 ? (
            <button
              type="button"
              onClick={() => onStepIndexChange(i - 1)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (isLast) onComplete();
              else onStepIndexChange(i + 1);
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {isLast ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(card, document.body);
}
