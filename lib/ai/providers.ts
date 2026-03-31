import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import type { AiUserConfig } from "@/lib/sds/settings-types";

export type AiProvider = "anthropic" | "google" | "openai";

const PROVIDERS: AiProvider[] = ["anthropic", "google", "openai"];

export function isAiProvider(x: unknown): x is AiProvider {
  return typeof x === "string" && PROVIDERS.includes(x as AiProvider);
}

export type AiModelPreset = {
  id: string;
  label: string;
  provider: AiProvider;
  modelId: string;
};

/** Presets shown in Settings; each implies provider + model id. */
export const AI_MODEL_PRESETS: AiModelPreset[] = [
  {
    /** Preset id kept for existing localStorage `activeModelPreset` values */
    id: "claude-3-5-sonnet",
    label: "Claude Sonnet 4.5",
    provider: "anthropic",
    modelId: "claude-sonnet-4-5-20250929",
  },
  {
    id: "gemini-1-5-pro",
    label: "Gemini 1.5 Pro",
    provider: "google",
    modelId: "gemini-1.5-pro",
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    provider: "openai",
    modelId: "gpt-4o",
  },
];

export function getPresetById(id: string): AiModelPreset {
  const hit = AI_MODEL_PRESETS.find((p) => p.id === id);
  return hit ?? AI_MODEL_PRESETS[0];
}

export function apiKeyForProvider(
  cfg: AiUserConfig,
  provider: AiProvider,
): string {
  switch (provider) {
    case "anthropic":
      return cfg.anthropicApiKey.trim();
    case "google":
      return cfg.googleApiKey.trim();
    case "openai":
      return cfg.openaiApiKey.trim();
  }
}

/** Merge BYOK with server env (Anthropic only) for backwards compatibility. */
export function resolveApiKeyForRequest(
  provider: AiProvider,
  fromBody: string,
): string {
  const k = (fromBody ?? "").trim();
  if (k) return k;
  if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY?.trim()) {
    return process.env.ANTHROPIC_API_KEY.trim();
  }
  return "";
}

export function createLanguageModel(
  provider: AiProvider,
  apiKey: string,
  modelId: string,
): LanguageModel {
  switch (provider) {
    case "anthropic":
      return createAnthropic({ apiKey })(modelId);
    case "google":
      return createGoogleGenerativeAI({ apiKey })(modelId);
    case "openai":
      return createOpenAI({ apiKey })(modelId);
  }
}

/** Surgical edit: tuned per provider strengths. */
export function surgicalSystemPrompt(provider: AiProvider): string {
  switch (provider) {
    case "anthropic":
      return `You are in Surgical Mode. You receive a single document block and a user instruction.
Follow instructions with high fidelity—preserve the author's voice unless asked to change it.
Return ONLY the modified block. No preamble, commentary, or markdown code fences.
Your entire response must be the rewritten block text and nothing else.`;
    case "google":
      return `You are in Surgical Mode. You receive one document block and an instruction.
Use careful reading—the full block is in context; apply the change precisely without drifting topic.
Return ONLY the rewritten block. No explanation, labels, or wrappers—just the block text.`;
    case "openai":
      return `You are in Surgical Mode (structured task). Input: one document block + one instruction.
Output rule: respond with ONLY the final rewritten block as plain text.
Do not include JSON, XML, reasoning steps, or preamble—only the block content.`;
  }
}

/** Generate draft: tuned per provider strengths. */
export function generateSystemPrompt(provider: AiProvider): string {
  switch (provider) {
    case "anthropic":
      return `You write clear, well-structured long-form text in Markdown—articles, memos, narratives, specs, or notes as the topic requires.
Follow heading hierarchy (##, ###), paragraphs, and bullet/numbered lists.
Output ONLY the Markdown document—no preamble or explanation.`;
    case "google":
      return `You draft long-form Markdown for any serious writing task: prose, documentation, or structured notes.
Use ## / ### headings, lists, and readable prose.
Output ONLY the Markdown document—no preamble.`;
    case "openai":
      return `You produce well-structured Markdown for long-form writing—any genre or purpose the user describes.
Use consistent heading levels, lists, and scannable sections.
Output ONLY the Markdown document with no preamble or meta-commentary.`;
  }
}
