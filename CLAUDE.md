# BeforeYouTweet — Project Rules

## Product
- BeforeYouTweet: a tweet analysis and improvement tool
- MVP — no login, no database, no payments
- Built by Mubarak

## Tech Stack
- Next.js (App Router) + Tailwind CSS
- Anthropic API (Claude models)
- Haiku for analysis (cheap, fast)
- Sonnet for tweet improvement (better writing quality)
- Upgrade to Opus 4.6 only when product is profitable

## Design
- Dark mode UI only
- Clean, modern style like AI tools
- Mobile-friendly

## Language
- Always support Arabic and English
- Auto-detect tweet language
- Return analysis and suggestions in the same language as the tweet
- Respect Arabic dialect (Saudi, Egyptian, etc.) — don't convert to formal Arabic

## AI Prompts
- Scoring must be strict and honest — most tweets should score 25-55
- Tweet improvements must sound human, not AI-generated
- No hashtags, no cringe phrases, no motivational poster language
- Always generate 3 versions when improving a tweet
- Always strip markdown/code blocks from LLM JSON responses

## Development
- Always test API endpoints after making changes
- Show real error messages (rate limit, auth) not generic "failed" messages
- Keep the codebase simple — one page file is fine for MVP, no over-engineering
- API key lives in .env.local (never commit it)

## Cost
- Minimize API costs — start cheap, upgrade when there's revenue
- Always consider token usage when changing prompts
