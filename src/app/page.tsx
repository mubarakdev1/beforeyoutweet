"use client";

import { useState } from "react";

interface Breakdown {
  hook: number;
  curiosity: number;
  clarity: number;
  shareability: number;
  emotion: number;
  length: number;
}

interface Analysis {
  score: number;
  breakdown: Breakdown;
  explanation: string;
  suggestions: string[];
}

interface ImprovedResult {
  improved_tweet: string;
  version_2: string;
  version_3: string;
  changes_made: string;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-slate-400 font-medium">/ 100</span>
      </div>
    </div>
  );
}

function BreakdownBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const percentage = (value / 10) * 100;
  const color =
    value >= 7 ? "bg-green-500" : value >= 4 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm text-slate-400 font-medium capitalize">
        {label}
      </span>
      <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-sm font-semibold text-slate-300 text-right">
        {value}
      </span>
    </div>
  );
}

export default function Home() {
  const [tweet, setTweet] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [improved, setImproved] = useState<ImprovedResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [improving, setImproving] = useState(false);
  const [error, setError] = useState("");

  const charCount = tweet.length;
  const charColor =
    charCount > 500
      ? "text-red-500"
      : charCount > 450
        ? "text-yellow-500"
        : "text-slate-500";

  async function handleAnalyze() {
    if (!tweet.trim()) return;
    setAnalyzing(true);
    setError("");
    setAnalysis(null);
    setImproved(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweet: tweet.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleImprove() {
    if (!tweet.trim()) return;
    setImproving(true);
    setError("");

    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweet: tweet.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImproved(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setImproving(false);
    }
  }

  function handleUseImproved() {
    if (improved) {
      setTweet(improved.improved_tweet);
      setImproved(null);
      setAnalysis(null);
    }
  }

  function handleShareOnX() {
    if (!analysis) return;
    const shareUrl = `https://beforeyoutweet.app/share/${analysis.score}`;
    const text = `I scored ${analysis.score}/100 on BeforeYouTweet.\n\nCan you beat it? 👇\n\n${shareUrl}`;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">
            Before<span className="text-blue-500">You</span>Tweet
          </h1>
          <span className="text-sm text-slate-500">
            Analyze before you post
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Tweet Input */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 mb-6">
          <label
            htmlFor="tweet"
            className="block text-sm font-semibold text-slate-300 mb-3"
          >
            Paste your tweet
          </label>
          <textarea
            id="tweet"
            value={tweet}
            onChange={(e) => setTweet(e.target.value)}
            placeholder="What's on your mind? Paste your tweet here..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
          />
          <div className="flex items-center justify-between mt-3">
            <span className={`text-sm font-medium ${charColor}`}>
              {charCount} / 500
            </span>
            <button
              onClick={handleAnalyze}
              disabled={!tweet.trim() || analyzing}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold text-sm hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {analyzing ? "Analyzing..." : "Analyze Tweet"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6 mb-6">
            {/* Score */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Viral Potential Score
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <ScoreRing score={analysis.score} />
                <div className="flex-1 space-y-3 w-full">
                  {Object.entries(analysis.breakdown).map(([key, value]) => (
                    <BreakdownBar key={key} label={key} value={value} />
                  ))}
                </div>
              </div>
              <button
                onClick={handleShareOnX}
                className="mt-5 w-full py-3 bg-white text-black rounded-full font-semibold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share Score on X
              </button>
            </div>

            {/* Explanation */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-3">
                Why this score?
              </h2>
              <p className="text-slate-400 leading-relaxed">
                {analysis.explanation}
              </p>
            </div>

            {/* Suggestions */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-3">
                Suggestions to improve
              </h2>
              <ul className="space-y-2">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2 text-slate-400">
                    <span className="text-blue-400 font-bold mt-0.5">
                      {i + 1}.
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>

              {/* Improve Button */}
              <button
                onClick={handleImprove}
                disabled={improving}
                className="mt-5 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold text-sm hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {improving ? "Improving..." : "Improve My Tweet with AI"}
              </button>
            </div>

            {/* Improved Tweets */}
            {improved && (
              <div className="bg-blue-500/10 rounded-2xl border border-blue-500/30 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  3 Improved Versions
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  <span className="font-medium text-slate-300">Approach:</span>{" "}
                  {improved.changes_made}
                </p>
                {[
                  { label: "Version 1 — Best", text: improved.improved_tweet },
                  { label: "Version 2 — Emotional", text: improved.version_2 },
                  { label: "Version 3 — Bold", text: improved.version_3 },
                ].map((v, i) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                      {v.label}
                    </span>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mt-1.5">
                      <p className="text-white text-base leading-relaxed whitespace-pre-line">
                        {v.text}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          setTweet(v.text);
                          setImproved(null);
                          setAnalysis(null);
                        }}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-full font-medium text-xs hover:bg-blue-500 transition-colors"
                      >
                        Use This
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(v.text)}
                        className="px-4 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-full font-medium text-xs hover:bg-slate-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-8 text-sm text-slate-600">
          Built by Mubarak &middot; BeforeYouTweet
        </footer>
      </main>
    </div>
  );
}
