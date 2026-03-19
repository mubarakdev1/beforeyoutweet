"use client";

import { useState, useEffect, useRef } from "react";

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

function getVerdict(score: number): { text: string; sub: string } {
  if (score >= 91) return { text: "This is a banger.", sub: "Post it now before you overthink it." };
  if (score >= 76) return { text: "This will hit.", sub: "One tweak away from going viral." };
  if (score >= 56) return { text: "Mid.", sub: "Your followers will like it. Nobody else will see it." };
  if (score >= 31) return { text: "This will flop. Hard.", sub: "Zero chance this gets engagement." };
  return { text: "Delete this.", sub: "Posting this will hurt your account." };
}

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    prevTarget.current = target;

    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

function ScoreRing({ score }: { score: number }) {
  const displayScore = useCountUp(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;
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
          className="transition-all duration-100 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold" style={{ color }}>
          {displayScore}
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

const COUNTER_KEY = "byt_tweets_scored";
const COUNTER_SEED = 1247;
const BEST_SCORE_KEY = "byt_best_score";
const LAST_SCORE_KEY = "byt_last_score";

function getTweetCount(): number {
  if (typeof window === "undefined") return COUNTER_SEED;
  const stored = localStorage.getItem(COUNTER_KEY);
  return stored ? parseInt(stored, 10) : COUNTER_SEED;
}

function incrementTweetCount(): number {
  const current = getTweetCount();
  const next = current + 1;
  localStorage.setItem(COUNTER_KEY, String(next));
  return next;
}

function getStoredScore(key: string): number | null {
  if (typeof window === "undefined") return null;
  const val = localStorage.getItem(key);
  return val ? parseInt(val, 10) : null;
}

function saveScores(score: number) {
  localStorage.setItem(LAST_SCORE_KEY, String(score));
  const best = getStoredScore(BEST_SCORE_KEY);
  if (best === null || score > best) {
    localStorage.setItem(BEST_SCORE_KEY, String(score));
  }
}

export default function Home() {
  const [tweet, setTweet] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [improved, setImproved] = useState<ImprovedResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [improving, setImproving] = useState(false);
  const [error, setError] = useState("");
  const [tweetCount, setTweetCount] = useState(COUNTER_SEED);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const improvedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTweetCount(getTweetCount());
    setLastScore(getStoredScore(LAST_SCORE_KEY));
    setBestScore(getStoredScore(BEST_SCORE_KEY));
  }, []);

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
      setTweetCount(incrementTweetCount());
      saveScores(data.score);
      setLastScore(data.score);
      setBestScore(prev => (prev === null || data.score > prev) ? data.score : prev);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function fetchImprove(): Promise<ImprovedResult | null> {
    const res = await fetch("/api/improve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tweet: tweet.trim() }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  }

  async function handleImprove() {
    if (!tweet.trim()) return;
    setImproving(true);
    setError("");

    try {
      const data = await fetchImprove();
      setImproved(data);
      setTimeout(() => improvedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setImproving(false);
    }
  }

  function isArabic(text: string): boolean {
    const arabicChars = text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g);
    return !!arabicChars && arabicChars.length > text.replace(/\s/g, "").length * 0.3;
  }

  function trimForShare(text: string, max: number): string {
    const oneLine = text.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
    if (oneLine.length <= max) return oneLine;
    return oneLine.slice(0, max - 1).trimEnd() + "\u2026";
  }

  function buildShareText(): string {
    const score = analysis!.score;
    const link = `https://beforeyoutweet.app/share/${score}`;
    const ar = isArabic(tweet);
    const t = trimForShare(tweet, 120);

    if (ar) {
      if (score < 40) return `"${t}"\n\nهذي جابت ${score}/100 \u{1F480}\n\nكم تجيب تغريدتك؟\n${link}`;
      if (score <= 70) return `"${t}"\n\nجابت ${score}/100\n\nكم تجيب تغريدتك؟ \u{1F447}\n${link}`;
      return `"${t}"\n\nهذي جابت ${score}/100 \u{1F525}\n\nتقدر تجيب أعلى؟\n${link}`;
    }

    if (score < 40) return `"${t}"\n\nthis scored ${score}/100 \u{1F480}\n\nhow does yours score?\n${link}`;
    if (score <= 70) return `"${t}"\n\nscored ${score}/100\n\nhow does yours score? \u{1F447}\n${link}`;
    return `"${t}"\n\nthis scored ${score}/100 \u{1F525}\n\ncan you beat it?\n${link}`;
  }

  function handleShareOnX() {
    if (!analysis) return;
    const text = buildShareText();
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
          <div className="flex items-center gap-3 text-xs">
            {bestScore !== null && (
              <span className="text-green-500 font-semibold">Best: {bestScore}</span>
            )}
            {lastScore !== null && (
              <span className="text-slate-500">Last: {lastScore}</span>
            )}
            <span className="text-slate-600">{tweetCount.toLocaleString()} scored</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Tweet Input */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 mb-6">
          <label
            htmlFor="tweet"
            className="block text-lg font-semibold text-white mb-1"
          >

            Will this tweet go viral?
          </label>
          <p className="text-sm text-slate-400 mb-4">
            Find out in 2 seconds. Paste it below.
          </p>
          <textarea
            id="tweet"
            value={tweet}
            onChange={(e) => setTweet(e.target.value)}
            placeholder="Paste your tweet here..."
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
              {analyzing ? "Analyzing..." : "Will It Go Viral?"}
            </button>
          </div>
        </div>

        {/* Example Preview (shown when no analysis yet) */}
        {!analysis && !analyzing && (
          <div className="bg-slate-900/30 rounded-2xl border border-slate-800/50 p-6 mb-6 opacity-60">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative inline-flex items-center justify-center">
                <svg width="100" height="100" className="-rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" strokeWidth="8" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#22c55e" strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 38}
                    strokeDashoffset={2 * Math.PI * 38 * (1 - 0.73)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-2xl font-bold text-green-500">73</span>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-white font-medium">&ldquo;Not bad, not viral.&rdquo;</p>
                <p className="text-slate-500 text-xs mt-1.5">Most tweets score under 60. Can yours beat that?</p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div ref={resultsRef} className="space-y-6 mb-6">
            {/* Score + Verdict */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="flex flex-col items-center">
                  <ScoreRing score={analysis.score} />
                  <p className="mt-3 text-lg font-bold text-white">
                    {getVerdict(analysis.score).text}
                  </p>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {getVerdict(analysis.score).sub}
                  </p>
                </div>
                <div className="flex-1 space-y-3 w-full">
                  {Object.entries(analysis.breakdown).map(([key, value]) => (
                    <BreakdownBar key={key} label={key} value={value} />
                  ))}
                </div>
              </div>

              {/* Action buttons right after score */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={handleImprove}
                  disabled={improving}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold text-sm hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {improving ? "Rewriting..." : analysis.score >= 76 ? "Make It Even Better" : "Make It Go Viral \u{1F680}"}
                </button>
                <button
                  onClick={handleShareOnX}
                  className="flex-1 py-3 bg-white text-black rounded-full font-semibold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Share on X
                </button>
              </div>
            </div>

            {/* Improved Tweets (right after score) */}
            {improved && (
              <div ref={improvedRef} className="bg-blue-500/10 rounded-2xl border border-blue-500/30 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Your tweet, rewritten 3 ways
                </h2>
                {/* Original tweet for comparison */}
                <div className="mb-5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Your Original
                  </span>
                  <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 mt-1.5">
                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line line-through decoration-slate-600">
                      {tweet}
                    </p>
                  </div>
                </div>
                {[
                  { label: "\u{1F525} This version will perform best", text: improved.improved_tweet, best: true },
                  { label: "Emotional Hit", text: improved.version_2, best: false },
                  { label: "Bold Take", text: improved.version_3, best: false },
                ].map((v, i) => (
                  <div key={i} className={`mb-4 last:mb-0 ${v.best ? "ring-1 ring-blue-500/50 rounded-xl" : ""}`}>
                    <div className={v.best ? "p-3" : ""}>
                      {v.best && (
                        <span className="text-xs font-medium text-green-400 mb-1 block">+{Math.min(Math.round((100 - analysis.score) * 0.7), 40)}% higher engagement potential</span>
                      )}
                      <span className={`text-xs font-semibold uppercase tracking-wide ${v.best ? "text-blue-300" : "text-blue-400"}`}>
                        {v.label}
                      </span>
                      <div className={`rounded-xl p-4 border mt-1.5 ${v.best ? "bg-slate-800/70 border-blue-500/30" : "bg-slate-800/50 border-slate-700"}`}>
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
                          Use This &amp; Score It
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(v.text)}
                          className="px-4 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-full font-medium text-xs hover:bg-slate-700 transition-colors"
                        >
                          Copy &amp; Post
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick fixes */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                What&apos;s holding it back
              </h2>
              <div className="space-y-2">
                {analysis.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-yellow-500 mt-0.5">&#9679;</span>
                    <span className="text-slate-300 text-sm">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Try Again Loop */}
            <div className="text-center py-4">
              <p className="text-slate-400 text-sm mb-3">
                {analysis.score >= 76
                  ? "Strong. But can you score even higher?"
                  : "Think you can beat this score? Try another tweet."}
              </p>
              <button
                onClick={() => {
                  setTweet("");
                  setAnalysis(null);
                  setImproved(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  document.getElementById("tweet")?.focus();
                }}
                className="px-6 py-2.5 bg-slate-800 text-white border border-slate-700 rounded-full font-semibold text-sm hover:bg-slate-700 transition-colors"
              >
                Try Another Tweet
              </button>
              {bestScore !== null && (
                <p className="text-slate-600 text-xs mt-2">Your best: {bestScore}/100</p>
              )}
            </div>
          </div>
        )}

        {/* Feedback Banner */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5 mb-6 text-center">
          <p className="text-slate-300 text-sm mb-3">
            What should I build next? Tell me in 30 seconds.
          </p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSeppXqTUiaymECwcm66vQzhX5K64Ajj024RMA-ENIzWwuBktw/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2.5 bg-slate-800 text-white border border-slate-700 rounded-full font-semibold text-sm hover:bg-slate-700 transition-colors"
          >
            Share Your Feedback
          </a>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 text-sm text-slate-600">
          Built by Mubarak &middot; BeforeYouTweet
        </footer>
      </main>
    </div>
  );
}
