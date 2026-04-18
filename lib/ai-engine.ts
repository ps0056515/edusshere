/**
 * Server-side AI helpers for `/api/ai/chat`.
 * Set OPENAI_API_KEY (required for most UI models) and optionally ANTHROPIC_API_KEY for Claude-* labels.
 */

export type AiEngineConfig = {
  model: string;
  tone: string;
  seo: string;
  auto: boolean;
  lang: string;
  refresh: string;
};

export function buildSystemPrompt(cfg: AiEngineConfig): string {
  return [
    "You are EduSphere's college counselling assistant for students in India.",
    `Respond in ${cfg.lang}.`,
    `Tone: ${cfg.tone}.`,
    `When giving recommendations, follow this content emphasis: ${cfg.seo} — stay natural; do not keyword-stuff.`,
    "Give practical guidance on colleges, entrance exams, courses, fees, and careers.",
    "If you lack reliable specifics, say so. Do not invent official cutoffs, ranks, or placement statistics.",
    "Keep answers concise unless the user asks for more detail.",
  ].join(" ");
}

function openAiModelId(uiModel: string): string {
  if (uiModel.includes("GPT-4o")) return process.env.OPENAI_MODEL_GPT4O ?? "gpt-4o";
  if (uiModel.includes("Gemini")) return process.env.OPENAI_MODEL_GEMINI_PROXY ?? "gpt-4o-mini";
  if (uiModel.includes("Claude")) return process.env.OPENAI_MODEL_CLAUDE_PROXY ?? "gpt-4o-mini";
  return process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
}

function anthropicModelId(uiModel: string): string {
  if (uiModel.includes("Opus")) return process.env.ANTHROPIC_MODEL_OPUS ?? "claude-3-opus-20240229";
  return process.env.ANTHROPIC_MODEL_SONNET ?? "claude-3-5-sonnet-20241022";
}

function useAnthropicForModel(uiModel: string): boolean {
  return /claude/i.test(uiModel) && Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

function normalizeAnthropicMessages(
  transcript: { role: "user" | "assistant"; content: string }[],
): { role: "user" | "assistant"; content: string }[] {
  const out = transcript
    .map((m) => ({ role: m.role, content: m.content.trim() }))
    .filter((m) => m.content.length > 0);
  while (out.length && out[0]!.role === "assistant") out.shift();
  return out.slice(-24);
}

async function callOpenAI(system: string, messages: { role: "user" | "assistant"; content: string }[], model: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error("MISSING_OPENAI");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.65,
      max_tokens: 1200,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}: ${raw.slice(0, 500)}`);
  const json = JSON.parse(raw) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI empty response");
  return text;
}

async function callAnthropic(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
  model: string,
): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) throw new Error("MISSING_ANTHROPIC");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      system,
      messages,
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}: ${raw.slice(0, 500)}`);
  const json = JSON.parse(raw) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const text = json.content?.find((b) => b.type === "text")?.text?.trim();
  if (!text) throw new Error("Anthropic empty response");
  return text;
}

export async function runAiChat(
  config: AiEngineConfig,
  transcript: { role: "user" | "assistant"; content: string }[],
): Promise<string> {
  const system = buildSystemPrompt(config);
  const trimmed = transcript
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }))
    .filter((m) => m.content.trim().length > 0);

  if (useAnthropicForModel(config.model)) {
    const msgs = normalizeAnthropicMessages(trimmed);
    if (msgs.length === 0) throw new Error("EMPTY_MESSAGES");
    return callAnthropic(system, msgs, anthropicModelId(config.model));
  }

  let openaiMessages = trimmed.slice(-24);
  while (openaiMessages.length > 0 && openaiMessages[0]!.role === "assistant") {
    openaiMessages = openaiMessages.slice(1);
  }
  if (openaiMessages.length === 0) throw new Error("EMPTY_MESSAGES");
  return callOpenAI(system, openaiMessages, openAiModelId(config.model));
}

export function aiProvidersConfigured(): { openai: boolean; anthropic: boolean } {
  return {
    openai: Boolean(process.env.OPENAI_API_KEY?.trim()),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
  };
}
