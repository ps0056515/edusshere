import { NextResponse } from "next/server";
import type { AiEngineConfig } from "@/lib/ai-engine";
import { runAiChat } from "@/lib/ai-engine";

const MAX_MESSAGES = 28;
const MAX_BODY = 120_000;

function isAiConfig(x: unknown): x is AiEngineConfig {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.model === "string" &&
    typeof o.tone === "string" &&
    typeof o.seo === "string" &&
    typeof o.auto === "boolean" &&
    typeof o.lang === "string" &&
    typeof o.refresh === "string"
  );
}

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY) {
      return NextResponse.json({ error: "Request too large." }, { status: 413 });
    }
    let body: unknown;
    try {
      body = JSON.parse(raw) as unknown;
    } catch {
      return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }
    const o = body as Record<string, unknown>;
    if (!isAiConfig(o.config)) {
      return NextResponse.json({ error: "Invalid config object." }, { status: 400 });
    }
    const msgs = o.messages;
    if (!Array.isArray(msgs)) {
      return NextResponse.json({ error: "messages must be an array." }, { status: 400 });
    }
    const transcript: { role: "user" | "assistant"; content: string }[] = [];
    for (const m of msgs.slice(-MAX_MESSAGES)) {
      if (!m || typeof m !== "object") continue;
      const r = (m as Record<string, unknown>).role;
      const c = (m as Record<string, unknown>).content;
      if ((r === "user" || r === "assistant") && typeof c === "string") {
        transcript.push({ role: r, content: c });
      }
    }
    if (transcript.length === 0) {
      return NextResponse.json({ error: "No valid messages." }, { status: 400 });
    }

    const text = await runAiChat(o.config, transcript);
    return NextResponse.json({ text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "MISSING_OPENAI" || msg === "MISSING_ANTHROPIC") {
      return NextResponse.json(
        { error: "AI is not configured. Set OPENAI_API_KEY (and ANTHROPIC_API_KEY for Claude models) in .env." },
        { status: 503 },
      );
    }
    if (msg === "EMPTY_MESSAGES") {
      return NextResponse.json({ error: "No valid user message to answer." }, { status: 400 });
    }
    console.error("[POST /api/ai/chat]", e);
    return NextResponse.json({ error: "AI request failed.", detail: msg.slice(0, 200) }, { status: 502 });
  }
}
