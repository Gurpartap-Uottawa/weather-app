# Weather App

A real-time weather app with an AI-powered chatbot assistant. It automatically detects your location via IP, displays current conditions, hourly and 3-day forecasts, and lets you ask weather-related questions through a floating chat widget.

---

## Features

- **Auto location detection** — uses your IP address on load, no permission prompt required
- **City search** — search any city worldwide to get its weather
- **Current weather** — temperature, feels like, today's high/low, and conditions
- **Hourly forecast** — next 24 hours with icons and temperatures
- **3-day forecast** — daily high/low and conditions for the next 3 days
- **AI weather chatbot** — streaming chat assistant powered by Groq (Llama 3.3 70B) that only answers weather-related questions with live weather context
- **Sparkles background** — animated particle background

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| UI Components | [shadcn/ui](https://ui.shadcn.com) (Button, Textarea, Tooltip, PromptInput) |
| Animations | [Framer Motion](https://www.framer.com/motion) |
| Particles | [tsParticles](https://particles.js.org) |
| Icons | [Lucide React](https://lucide.dev) |
| Weather API | [WeatherAPI.com](https://www.weatherapi.com) |
| AI Model | [Groq](https://groq.com) — Llama 3.3 70B Versatile |
| Font | [Geist](https://vercel.com/font) |

---

## API Keys Required

This app requires two API keys. Create a `.env.local` file in the project root and add both:

```env
WEATHERAPI_KEY=your_weatherapi_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### 1. WeatherAPI Key

Used for all weather data: current conditions, hourly forecast, 3-day forecast, and location detection.

**How to get it (free):**
1. Go to [weatherapi.com/signup.aspx](https://www.weatherapi.com/signup.aspx)
2. Create a free account (no credit card required)
3. Your API key is shown on the dashboard immediately after signup
4. The free plan includes **1 million calls/month** and supports current weather + 3-day forecast

### 2. Groq API Key

Used to power the AI weather chatbot with streaming responses.

**How to get it (free):**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up with your email (no credit card required)
3. Navigate to **API Keys** in the sidebar
4. Click **Create API Key**, give it a name, and copy it
5. The free tier includes **1,000 requests/day** — more than enough for personal use

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Gurpartap-Uottawa/weather-app.git
cd weather-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
WEATHERAPI_KEY=your_weatherapi_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
weather-app/
├── app/
│   ├── api/
│   │   ├── weather/route.ts   # WeatherAPI proxy (keeps key server-side)
│   │   └── chat/route.ts      # Groq streaming chat endpoint
│   ├── page.tsx               # Main weather page
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles + Tailwind + shadcn variables
├── components/
│   └── ui/
│       ├── sparkles.tsx       # Particle background
│       ├── chat-widget.tsx    # Floating AI chatbot
│       ├── prompt-input.tsx   # Auto-resizing chat input
│       ├── button.tsx         # shadcn Button
│       ├── textarea.tsx       # shadcn Textarea
│       └── tooltip.tsx        # shadcn Tooltip
└── lib/
    └── utils.ts               # cn() helper for Tailwind class merging
```

---

## Security

- API keys are stored in `.env.local` which is **gitignored** — they are never committed or exposed to the client
- All external API calls are made server-side through Next.js route handlers
- The `GROQ_API_KEY` and `WEATHERAPI_KEY` variables have no `NEXT_PUBLIC_` prefix, so they cannot be accessed from the browser
