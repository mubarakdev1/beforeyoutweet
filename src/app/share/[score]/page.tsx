import { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ score: string }>;
}): Promise<Metadata> {
  const { score: scoreParam } = await params;
  const score = Math.min(100, Math.max(0, parseInt(scoreParam) || 0));

  return {
    title: `I scored ${score}/100 on BeforeYouTweet!`,
    description: `My tweet got a viral potential score of ${score}/100. Can you beat it? Try BeforeYouTweet — score your tweet before you post it.`,
    openGraph: {
      title: `I scored ${score}/100 on BeforeYouTweet!`,
      description: `My tweet got a viral potential score of ${score}/100. Can you beat it?`,
      url: `https://beforeyoutweet.app/share/${score}`,
      siteName: "BeforeYouTweet",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `I scored ${score}/100 on BeforeYouTweet!`,
      description: `My tweet got a viral potential score of ${score}/100. Can you beat it?`,
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ score: string }>;
}) {
  // When someone clicks the shared link, redirect them to the main app
  await params;
  redirect("/");
}
