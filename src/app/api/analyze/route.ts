import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "../rate-limit";

const client = new Anthropic();

const PROMPT_PREFIX = `You are a brutal, honest viral tweet analyst. You score tweets harshly and accurately. Most tweets are mediocre — score them accordingly. Do NOT be generous.

Return a JSON response. No markdown, no code blocks, just raw JSON:

{
  "score": <number 0-100>,
  "breakdown": {
    "hook": <number 0-10>,
    "curiosity": <number 0-10>,
    "clarity": <number 0-10>,
    "shareability": <number 0-10>,
    "emotion": <number 0-10>,
    "length": <number 0-10>
  },
  "explanation": "<2-3 sentences explaining the score>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
}

SCORING RULES — BE STRICT BUT FAIR:
- 0-20: Terrible. Generic, boring, no one would engage.
- 21-40: Below average. Has an idea but poor execution.
- 41-60: Average. Decent tweet but won't go viral.
- 61-75: Good. Has some viral elements but needs work.
- 76-85: Very good. Strong hook, emotion, and shareability.
- 86-95: Excellent. Multiple viral elements working together. Would perform very well on X.
- 96-100: Masterpiece. Perfect hook, powerful emotion, extremely shareable, flawless execution. The kind of tweet that gets 50K+ retweets. Rare but achievable.

Most tweets should score between 25-55. A score above 75 means the tweet is genuinely strong. A score of 96-100 requires excellence across ALL dimensions — but if a tweet truly nails every element, give it the score it deserves.

Metric scoring (0-10) — use the FULL range, including 10:
- hook: Does the first line stop the scroll? Average: 3-5. Good: 6-7. Strong: 8. Excellent: 9. Perfect scroll-stopper that DEMANDS attention: 10.
- curiosity: Does it make people need to read more? Average: 3-5. Good: 6-7. Strong: 8. Excellent: 9. Impossible to stop reading: 10.
- clarity: Is the message instantly clear? Average: 5-7. Good: 8. Crystal clear: 9. Flawlessly clear, zero ambiguity: 10.
- shareability: Would people actually retweet this? Average: 3-5. Good: 6-7. Strong: 8. Very high: 9. People NEED to share this: 10.
- emotion: Does it trigger a real feeling? Average: 3-5. Good: 6-7. Strong: 8. Powerful: 9. Gut-punch, tears-level emotion: 10.
- length: Is it the right length? Too short (<40 chars) or too long (>250 chars): 3-5. Decent: 6-7. Good: 8. Great (70-180 chars): 9. Perfect sweet spot (100-160 chars): 10.

A score of 10 means PERFECT in that dimension. It is rare but you MUST give it when earned. Do not cap at 9 out of caution.

NOTE: The overall score will be calculated automatically from the metrics. Focus on scoring each metric accurately — the overall score field will be overridden.

IMPORTANT: Detect the language of the tweet. If the tweet is in Arabic, return the explanation and suggestions in Arabic. If English, return in English. Always match the tweet's language.

Tweet to analyze:
`;

function parseAnalysis(raw: string) {
  let text = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new SyntaxError("No JSON object found in response");
  }
  text = text.slice(jsonStart, jsonEnd + 1);
  // Clean any control characters that might break JSON parsing
  text = text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
  return JSON.parse(text);
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { maxRequests: 10, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  try {
    const { tweet } = await req.json();

    if (!tweet || typeof tweet !== "string" || tweet.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide a tweet to analyze." },
        { status: 400 }
      );
    }

    if (tweet.length > 500) {
      return NextResponse.json(
        { error: "Tweet is too long. Keep it under 500 characters." },
        { status: 400 }
      );
    }

    const promptContent = PROMPT_PREFIX + JSON.stringify(tweet);

    // Try up to 2 times if JSON parsing fails
    let analysis;
    for (let attempt = 0; attempt < 2; attempt++) {
      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: promptContent }],
      });

      const content = message.content[0];
      if (content.type !== "text") continue;

      try {
        analysis = parseAnalysis(content.text);
        break;
      } catch {
        console.error(`JSON parse failed (attempt ${attempt + 1}), raw:`, content.text.slice(0, 200));
        if (attempt === 1) throw new Error("Failed to parse AI response after 2 attempts");
      }
    }

    // Calculate score from metrics to ensure consistency
    if (analysis?.breakdown) {
      const { hook, curiosity, clarity, shareability, emotion, length } = analysis.breakdown;
      const avg = (hook + curiosity + clarity + shareability + emotion + length) / 6;
      // Scale: avg 0-6 maps linearly to 0-60, avg 6-9.5 maps to 60-100
      // This lets truly great tweets (avg 9+) actually reach 95-100
      let score;
      if (avg <= 6) {
        score = Math.round(avg * 10);
      } else {
        score = Math.round(60 + ((avg - 6) / 3.5) * 40);
      }
      analysis.score = Math.min(100, score);
    }

    return NextResponse.json(analysis);
  } catch (error: unknown) {
    console.error("Analysis error:", error);
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
      { error: "Failed to analyze tweet. Please try again." },
      { status: 500 }
    );
  }
}
