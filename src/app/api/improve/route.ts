import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "../rate-limit";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { maxRequests: 10, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  try {
    const { tweet } = await req.json();

    if (!tweet || typeof tweet !== "string" || tweet.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide a tweet to improve." },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a top Twitter ghostwriter. You rewrite tweets to make them go viral while keeping the author's authentic voice.

Your job: take this tweet and give back THREE different improved versions. Each version should take a different angle.

WRITING RULES:
- Sound like a REAL person talking, not an AI or a copywriter.
- The first line MUST be a scroll-stopper. If someone is scrolling fast, your first line should make them stop.
- Short sentences. Line breaks between ideas. White space is your friend.
- Cut every unnecessary word. Be ruthless.
- NO hashtags. NO excessive emojis. NO generic motivational language.
- NO cliche phrases in any language (no "game changer", no "let that sink in", no "الحقيقة الصادمة", no "خلوني أقولكم شي").
- Use specific details, numbers, or stories — not vague claims.
- Keep the same language, dialect, and tone as the original. If it's Saudi dialect, keep it Saudi. If it's formal Arabic, keep it formal.
- Each version MUST be under 280 characters.

Return ONLY raw JSON. No markdown, no code blocks:

{
  "improved_tweet": "<your best version — the one most likely to go viral>",
  "version_2": "<alternative angle — maybe more emotional or personal>",
  "version_3": "<alternative angle — maybe more bold or controversial>",
  "changes_made": "<1-2 sentences explaining your approach>"
}

Original tweet:
${JSON.stringify(tweet)}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Unexpected response format." },
        { status: 500 }
      );
    }

    let text = content.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.slice(jsonStart, jsonEnd + 1);
    }
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      text = text.replace(/[\x00-\x1f\x7f]/g, (ch) => ch === "\n" || ch === "\t" ? ch : "");
      result = JSON.parse(text);
    }
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Improve error:", error);
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few seconds and try again." },
        { status: 429 }
      );
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Invalid API key. Please check your ANTHROPIC_API_KEY." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Failed to improve tweet. Please try again." },
      { status: 500 }
    );
  }
}
