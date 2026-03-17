import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ score: string }>;
}): Promise<Metadata> {
  const { score: scoreParam } = await params;
  const score = Math.min(100, Math.max(0, parseInt(scoreParam) || 0));

  const imageUrl = `https://beforeyoutweet.app/share/${score}/opengraph-image`;

  return {
    title: `I scored ${score}/100 on BeforeYouTweet!`,
    description: `My tweet got a viral potential score of ${score}/100. Can you beat it? Try BeforeYouTweet — score your tweet before you post it.`,
    openGraph: {
      title: `I scored ${score}/100 on BeforeYouTweet!`,
      description: `My tweet got a viral potential score of ${score}/100. Can you beat it?`,
      url: `https://beforeyoutweet.app/share/${score}`,
      siteName: "BeforeYouTweet",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `I scored ${score}/100 on BeforeYouTweet!`,
      description: `My tweet got a viral potential score of ${score}/100. Can you beat it?`,
      images: [imageUrl],
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ score: string }>;
}) {
  const { score: scoreParam } = await params;
  const score = Math.min(100, Math.max(0, parseInt(scoreParam) || 0));

  // Client-side redirect after page loads (so crawlers see the meta tags first)
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <meta httpEquiv="refresh" content="0;url=/" />
      <div className="text-center">
        <div className="text-6xl font-bold text-blue-500 mb-4">{score}/100</div>
        <p className="text-slate-400 text-lg">Redirecting to BeforeYouTweet...</p>
      </div>
    </div>
  );
}
