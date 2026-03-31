"use client";

import type { ChangeEvent, RefObject } from "react";
import {
  FileCode2,
  FolderOpen,
  Settings2,
  Sparkles,
  Upload,
} from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type FlowBusy = "idle" | "parse" | "file" | "load" | "generate";

type Props = {
  genTopic: string;
  onGenTopicChange: (v: string) => void;
  onGenerate: () => void;
  slug: string;
  onSlugChange: (v: string) => void;
  onLoadGithub: () => void;
  paste: string;
  onPasteChange: (v: string) => void;
  onParse: () => void;
  onOpenSettings: () => void;
  busy: boolean;
  flowBusy: FlowBusy;
  githubConnected: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileSelected: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function LandingPage({
  genTopic,
  onGenTopicChange,
  onGenerate,
  slug,
  onSlugChange,
  onLoadGithub,
  paste,
  onPasteChange,
  onParse,
  onOpenSettings,
  busy,
  flowBusy,
  githubConnected,
  fileInputRef,
  onFileSelected,
}: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-start overflow-y-auto px-4 pt-4 pb-10 sm:pt-5 sm:pb-14">
      <div className="w-full max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-base font-medium text-indigo-600 sm:text-lg">
            Hello — let&apos;s get you editing.
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Welcome to Surgical Doc Studio
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base leading-relaxed text-zinc-600 sm:text-lg">
            This is a Markdown text editor for long-form writing: you work in sections, and AI
            refines <span className="font-medium text-zinc-800">one piece at a time</span> instead of
            regenerating the whole document and scrambling what you already liked.{" "}
            <span className="whitespace-nowrap">Tweezers, not a wrecking ball.</span>
          </p>
          <p className="mt-6 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
            Choose one option below to get started.
          </p>
          <p className="mt-3 max-w-xl mx-auto text-base text-zinc-600 sm:text-lg">
            Use{" "}
            <button
              type="button"
              onClick={onOpenSettings}
              className="font-semibold text-indigo-700 underline decoration-indigo-200 underline-offset-2 hover:text-indigo-900"
            >
              Settings
            </button>{" "}
            for repo, branch, and API keys when you need them.
          </p>
        </div>

        <div
          className="grid gap-6 md:grid-cols-3"
          role="group"
          aria-label="Ways to open or start a document—pick one option"
        >
          <section className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="text-base font-semibold text-zinc-900">New AI draft</h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Describe what you&apos;re writing; we&apos;ll draft structured Markdown you refine in
              the editor.
            </p>
            <textarea
              value={genTopic}
              onChange={(e) => onGenTopicChange(e.target.value)}
              rows={4}
              placeholder="e.g. a one-page brief on our Q3 roadmap"
              className="mt-4 min-h-0 w-full resize-y rounded-lg border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            />
            <button
              type="button"
              disabled={busy}
              onClick={onGenerate}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {flowBusy === "generate" ? (
                <LoadingSpinner className="h-4 w-4 text-white" />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden />
              )}
              Generate
            </button>
          </section>

          <section className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <FolderOpen className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="text-base font-semibold text-zinc-900">Load from GitHub</h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Loads <code className="rounded bg-zinc-100 px-1 font-mono text-[11px]">sds/&lt;name&gt;.md</code>{" "}
              from the repo in Settings.
              {!githubConnected ? (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="font-medium text-indigo-600 underline decoration-indigo-200 underline-offset-2 hover:text-indigo-800"
                  >
                    Connect GitHub
                  </button>{" "}
                  first.
                </>
              ) : null}
            </p>
            <label className="mt-4 block text-xs font-medium text-zinc-600">
              Document name (slug)
            </label>
            <input
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="my-document"
              autoComplete="off"
              spellCheck={false}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
            />
            <button
              type="button"
              disabled={busy}
              onClick={onLoadGithub}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
            >
              {flowBusy === "load" ? (
                <LoadingSpinner className="h-4 w-4 text-zinc-700" />
              ) : (
                <FolderOpen className="h-4 w-4 text-zinc-600" aria-hidden />
              )}
              Load
            </button>
          </section>

          <section className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white">
              <FileCode2 className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="text-base font-semibold text-zinc-900">Import Markdown</h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Upload a <code className="rounded bg-zinc-100 px-1 font-mono text-[11px]">.md</code> or{" "}
              <code className="rounded bg-zinc-100 px-1 font-mono text-[11px]">.txt</code> file, or
              paste text—we&apos;ll split it into sections you can edit.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt,text/markdown,text/plain"
              className="sr-only"
              tabIndex={-1}
              onChange={onFileSelected}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 disabled:opacity-50"
            >
              {flowBusy === "file" ? (
                <LoadingSpinner className="h-4 w-4 text-zinc-700" />
              ) : (
                <Upload className="h-4 w-4 text-zinc-600" aria-hidden />
              )}
              Upload file
            </button>
            <label className="mt-4 block text-xs font-medium text-zinc-600">
              Or paste Markdown
            </label>
            <textarea
              value={paste}
              onChange={(e) => onPasteChange(e.target.value)}
              rows={5}
              placeholder="Paste Markdown or plain text..."
              className="mt-1 min-h-0 w-full flex-1 resize-y rounded-lg border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
            <button
              type="button"
              disabled={busy}
              onClick={onParse}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
            >
              {flowBusy === "parse" ? (
                <LoadingSpinner className="h-4 w-4 text-white" />
              ) : (
                <FileCode2 className="h-4 w-4" aria-hidden />
              )}
              Parse & open
            </button>
          </section>
        </div>

        <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-zinc-500">
          <Settings2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Repository, branch, and tokens live in Settings — same place the editor uses for sync.
        </p>
      </div>
    </div>
  );
}
