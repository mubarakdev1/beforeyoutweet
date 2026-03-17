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
          background: "linear-gradient(135deg, #0a0a1a 0%, #0f172a 50%, #0a0a1a 100%)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Score ring decoration */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <svg width="120" height="120" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r="54"
              fill="none"
              stroke="#1e293b"
              strokeWidth="10"
            />
            <circle
              cx="70"
              cy="70"
              r="54"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="10"
              strokeDasharray="339.29"
              strokeDashoffset="67.86"
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
            <text
              x="70"
              y="65"
              textAnchor="middle"
              fill="#3b82f6"
              fontSize="36"
              fontWeight="bold"
            >
              80
            </text>
            <text
              x="70"
              y="88"
              textAnchor="middle"
              fill="#64748b"
              fontSize="14"
            >
              / 100
            </text>
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 56,
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
            fontSize: 24,
            color: "#94a3b8",
            marginTop: 16,
            display: "flex",
          }}
        >
          Score your tweet before you post it
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 40,
          }}
        >
          {["Viral Score", "AI Analysis", "Smart Rewrite"].map((text) => (
            <div
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: 999,
                padding: "8px 20px",
                fontSize: 18,
                color: "#93c5fd",
              }}
            >
              {text}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 18,
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
