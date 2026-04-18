import { NextResponse } from "next/server";
import { aiProvidersConfigured } from "@/lib/ai-engine";

/** Which LLM providers have env keys (no secrets returned). */
export async function GET() {
  return NextResponse.json(aiProvidersConfigured());
}
