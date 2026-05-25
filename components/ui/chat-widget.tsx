"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircle, X, ArrowUp, Square, CloudSun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface WeatherContext {
  location: string
  temp: number
  feelsLike: number
  condition: string
  high: number
  low: number
}

interface ChatWidgetProps {
  weatherContext: WeatherContext | null
}

export function ChatWidget({ weatherContext }: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const buildWeatherContext = () => {
    if (!weatherContext) return "Weather data not available."
    return [
      `Location: ${weatherContext.location}`,
      `Temperature: ${weatherContext.temp}°C`,
      `Feels like: ${weatherContext.feelsLike}°C`,
      `Condition: ${weatherContext.condition}`,
      `Today's high: ${weatherContext.high}°C`,
      `Today's low: ${weatherContext.low}°C`,
    ].join("\n")
  }

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages([...newMessages, { role: "assistant", content: "" }])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          weatherContext: buildWeatherContext(),
        }),
      })

      if (!res.ok || !res.body) throw new Error("Request failed")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          return [...prev.slice(0, -1), { ...last, content: last.content + text }]
        })
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
          style={{ height: "420px" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 shrink-0">
            <div className="flex items-center gap-2">
              <CloudSun className="size-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Weather Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
            {messages.length === 0 && (
              <p className="text-slate-500 text-xs text-center mt-6">
                Ask me anything about the weather!
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-100"
                  }`}
                >
                  {msg.content || (
                    <span className="flex gap-1 items-center">
                      <span className="animate-bounce">·</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>·</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>·</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-700 shrink-0">
            <PromptInput
              value={input}
              onValueChange={setInput}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              maxHeight={120}
            >
              <PromptInputTextarea
                placeholder="Ask about the weather..."
                className="text-white placeholder:text-slate-500 min-h-[36px] text-sm"
              />
              <PromptInputActions className="justify-end pt-1">
                <PromptInputAction tooltip={isLoading ? "Stop" : "Send message"}>
                  <Button
                    size="icon"
                    className="h-7 w-7 rounded-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleSubmit}
                    disabled={!input.trim() && !isLoading}
                  >
                    {isLoading ? (
                      <Square className="size-3 fill-current" />
                    ) : (
                      <ArrowUp className="size-3" />
                    )}
                  </Button>
                </PromptInputAction>
              </PromptInputActions>
            </PromptInput>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <Button
        size="icon"
        className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </Button>
    </div>
  )
}
