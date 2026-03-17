import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "My BeforeYouTweet Score";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ score: string }>;
}) {
  const { score: scoreParam } = await params;
  const score = Math.min(100, Math.max(0, parseInt(scoreParam) || 0));
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a1a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 180,
            height: 180,
            borderRadius: 90,
            border: `10px solid ${color}`,
            marginBottom: 32,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: color,
            }}
          >
            {score}
          </span>
        </div>

        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            marginBottom: 24,
            display: "flex",
          }}
        >
          Viral Potential Score
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 800,
          }}
        >
          <span style={{ color: "#ffffff" }}>Before</span>
          <span style={{ color: "#3b82f6" }}>You</span>
          <span style={{ color: "#ffffff" }}>Tweet</span>
        </div>

        <div
          style={{
            fontSize: 24,
            color: "#64748b",
            marginTop: 20,
            display: "flex",
          }}
        >
          Can you beat this score?
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontSize: 20,
            color: "#475569",
            display: "flex",
          }}
        >
          beforeyoutweet.app
        </div>
      </div>
    ),
    { ...size }
  );
}
