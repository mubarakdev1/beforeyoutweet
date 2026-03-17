import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BeforeYouTweet — Analyze & Improve Your Tweets with AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
        {/* Score circle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 60,
            border: "8px solid #3b82f6",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: "#3b82f6",
              }}
            >
              80
            </span>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{ color: "#ffffff" }}>Before</span>
          <span style={{ color: "#3b82f6" }}>You</span>
          <span style={{ color: "#ffffff" }}>Tweet</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            marginTop: 20,
            display: "flex",
          }}
        >
          Score your tweet before you post it
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              background: "rgba(59, 130, 246, 0.15)",
              border: "2px solid rgba(59, 130, 246, 0.4)",
              borderRadius: 999,
              padding: "12px 28px",
              fontSize: 20,
              color: "#93c5fd",
            }}
          >
            Viral Score
          </div>
          <div
            style={{
              display: "flex",
              background: "rgba(59, 130, 246, 0.15)",
              border: "2px solid rgba(59, 130, 246, 0.4)",
              borderRadius: 999,
              padding: "12px 28px",
              fontSize: 20,
              color: "#93c5fd",
            }}
          >
            AI Analysis
          </div>
          <div
            style={{
              display: "flex",
              background: "rgba(59, 130, 246, 0.15)",
              border: "2px solid rgba(59, 130, 246, 0.4)",
              borderRadius: 999,
              padding: "12px 28px",
              fontSize: 20,
              color: "#93c5fd",
            }}
          >
            Smart Rewrite
          </div>
        </div>

        {/* URL */}
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
