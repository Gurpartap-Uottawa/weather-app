import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

function systemPrompt(weatherContext: string) {
  return `You are a helpful weather assistant embedded in a weather app.

Current weather data for the user's location:
${weatherContext}

Your role: ONLY answer questions related to weather, climate, meteorology, or weather-related advice — such as what to wear, whether to carry an umbrella, best time to go outside, or outdoor activity recommendations based on current conditions.

If asked about anything unrelated to weather, politely decline and remind the user you are a weather-focused assistant. Keep responses concise, practical, and friendly.`
}

export async function POST(request: Request) {
  const { messages, weatherContext } = await request.json()

  const stream = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 512,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt(weatherContext) },
      ...messages,
    ],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ""
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
