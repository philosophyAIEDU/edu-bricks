# Edu Bricks

Chat with AI to build React apps instantly. Made by the [Firecrawl](https://firecrawl.dev/?ref=edu-bricks-github) team.

<img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmZtaHFleGRsMTNlaWNydGdianI4NGQ4dHhyZjB0d2VkcjRyeXBucCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZFVLWMa6dVskQX0qu1/giphy.gif" alt="Edu Bricks Demo" width="100%"/>

## Setup

1. **Clone & Install**
```bash
git clone https://github.com/mendableai/edu-bricks.git
cd edu-bricks
npm install
```

2. **Add `.env.local`**
```env
# Required
E2B_API_KEY=your_e2b_api_key  # Get from https://e2b.dev (Sandboxes)
FIRECRAWL_API_KEY=your_firecrawl_api_key  # Get from https://firecrawl.dev (Web scraping)

# Optional (need at least one AI provider)
ANTHROPIC_API_KEY=your_anthropic_api_key  # Get from https://console.anthropic.com
OPENAI_API_KEY=your_openai_api_key  # Get from https://platform.openai.com (GPT-5)
GEMINI_API_KEY=your_gemini_api_key  # Get from https://aistudio.google.com/app/apikey
GROQ_API_KEY=your_groq_api_key  # Get from https://console.groq.com (Fast inference - Kimi K2 recommended)
```

3. **Run**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)  

## Deployment

### Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Build settings are automatically configured via `netlify.toml`
3. **Important**: Add environment variables in Netlify dashboard (Site settings → Environment variables):
   - `GEMINI_API_KEY=your_gemini_api_key` (required for AI features)
   - `E2B_API_KEY=your_e2b_api_key` (optional - demo mode works without this)
4. Without environment variables, the site runs in demo mode with limited functionality

### Vercel
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## License

MIT
