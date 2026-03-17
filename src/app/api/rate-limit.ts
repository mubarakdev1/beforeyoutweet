import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function rateLimit(
  req: NextRequest,
  { maxRequests, windowMs }: { maxRequests: number; windowMs: number }
): NextResponse | null {
  const ip = getIP(req);
  const key = `${ip}:${req.nextUrl.pathname}`;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (entry.count >= maxRequests) {
    const minutesLeft = Math.ceil((entry.resetAt - now) / 60000);
    return NextResponse.json(
      {
        error: `You've reached the limit (${maxRequests} per hour). Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`,
      },
      { status: 429 }
    );
  }

  entry.count++;
  return null;
}
