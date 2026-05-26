'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { LocateFixed, Search } from 'lucide-react'
import { SparklesCore } from '@/components/ui/sparkles'
import { ChatWidget } from '@/components/ui/chat-widget'

interface Condition {
  text: string
  icon: string
  code: number
}

interface Current {
  temp_c: number
  feelslike_c: number
  humidity: number
  wind_kph: number
  uv: number
  condition: Condition
}

interface Hour {
  time_epoch: number
  temp_c: number
  condition: Condition
}

interface Day {
  maxtemp_c: number
  mintemp_c: number
  condition: Condition
}

interface ForecastDay {
  date_epoch: number
  date: string
  day: Day
  hour: Hour[]
}

interface WeatherData {
  location: { name: string; region: string; country: string }
  current: Current
  forecast: { forecastday: ForecastDay[] }
}

function round(n: number) {
  return Math.round(n)
}

function formatHour(epoch: number) {
  return new Date(epoch * 1000).toLocaleTimeString([], { hour: 'numeric', hour12: true })
}

function formatDay(epoch: number) {
  const date = new Date(epoch * 1000)
  if (date.toDateString() === new Date().toDateString()) return 'Today'
  return date.toLocaleDateString([], { weekday: 'short' })
}

function WeatherIcon({ icon, size = 40 }: { icon: string; size?: number }) {
  return (
    <Image
      src={`https:${icon}`}
      alt=""
      width={size}
      height={size}
      unoptimized
    />
  )
}

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState<string | null>(null)
  const [gpsQuery, setGpsQuery] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Get GPS location on mount, fall back to IP detection if denied
  useEffect(() => {
    if (!navigator.geolocation) {
      setQuery('auto:ip')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const q = `${pos.coords.latitude},${pos.coords.longitude}`
        setGpsQuery(q)
        setQuery(q)
      },
      () => setQuery('auto:ip'),
      { timeout: 8000 }
    )
  }, [])

  useEffect(() => {
    if (!query) return
    let cancelled = false

    const fetchWeather = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/weather?q=${encodeURIComponent(query)}`)
        if (!res.ok) {
          const d = await res.json().catch(() => ({}))
          throw new Error(d?.detail ?? 'Not found')
        }
        const data = await res.json()
        if (!cancelled) setWeather(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load weather data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchWeather()
    return () => { cancelled = true }
  }, [query])

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault()
    const trimmed = searchInput.trim()
    if (!trimmed) return
    setQuery(trimmed)
    setSearchInput('')
    inputRef.current?.blur()
  }

  const handleMyLocation = () => {
    if (gpsQuery) {
      setQuery(gpsQuery)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const q = `${pos.coords.latitude},${pos.coords.longitude}`
        setGpsQuery(q)
        setQuery(q)
      },
      () => setQuery('auto:ip'),
      { timeout: 8000 }
    )
  }

  if (!query || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white/70 text-lg animate-pulse">
          {!query ? 'Detecting your location…' : 'Fetching your weather…'}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="text-center text-white space-y-4">
          <p className="text-5xl">⚠️</p>
          <p className="text-white/70 text-base">{error}</p>
          <form onSubmit={handleSearch} className="flex items-center gap-2 justify-center mt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
              <input
                ref={inputRef}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Try another city..."
                className="bg-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/40 border border-white/20 focus:outline-none focus:border-white/40 w-52"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-full transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (!weather) return null

  const { location, current, forecast } = weather
  const today = forecast.forecastday[0]
  const locationLabel = [location.name, location.region, location.country]
    .filter(Boolean)
    .join(', ')

  const now = Date.now()
  const futureHours = forecast.forecastday
    .flatMap((d) => d.hour)
    .filter((h) => h.time_epoch * 1000 >= now)
    .slice(0, 24)

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="weather-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={80}
          className="w-full h-full"
          particleColor="#FFFFFF"
          speed={1}
        />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 py-10 flex flex-col gap-5">

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
            <input
              ref={inputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search city..."
              className="w-full bg-white/10 backdrop-blur-sm rounded-full pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 border border-white/10 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
          {gpsQuery && query !== gpsQuery && (
            <button
              type="button"
              onClick={handleMyLocation}
              title="Back to my location"
              className="bg-white/10 hover:bg-white/20 text-white/70 hover:text-white p-2.5 rounded-full transition-colors shrink-0"
            >
              <LocateFixed className="size-4" />
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2.5 rounded-full transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        {/* Current weather */}
        <section className="flex flex-col items-center text-center pt-2">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-1">
            {locationLabel}
          </p>
          <WeatherIcon icon={current.condition.icon} size={88} />
          <p className="text-lg text-white/70 capitalize -mt-2 mb-3">{current.condition.text}</p>
          <p className="text-9xl font-extralight leading-none">{round(current.temp_c)}°</p>
          <div className="flex items-center gap-5 mt-5 text-sm text-white/60">
            <span>Feels like <span className="text-white/90">{round(current.feelslike_c)}°</span></span>
            <span>H: <span className="text-white/90">{round(today.day.maxtemp_c)}°</span></span>
            <span>L: <span className="text-white/90">{round(today.day.mintemp_c)}°</span></span>
          </div>
        </section>

        {/* Hourly forecast */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 pt-3 pb-4">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-3">Hourly Forecast</p>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {futureHours.map((h) => (
              <div key={h.time_epoch} className="flex flex-col items-center gap-1 min-w-[52px]">
                <span className="text-xs text-white/50">{formatHour(h.time_epoch)}</span>
                <WeatherIcon icon={h.condition.icon} size={34} />
                <span className="text-sm font-medium">{round(h.temp_c)}°</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3-day forecast */}
        <section className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 pt-3 pb-2">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-1">3-Day Forecast</p>
          <div className="divide-y divide-white/10">
            {forecast.forecastday.map((d) => (
              <div key={d.date_epoch} className="flex items-center justify-between py-3">
                <span className="w-14 text-sm text-white/80 font-medium">{formatDay(d.date_epoch)}</span>
                <div className="flex items-center gap-2 flex-1 px-2">
                  <WeatherIcon icon={d.day.condition.icon} size={30} />
                  <span className="text-xs text-white/50 capitalize truncate">{d.day.condition.text}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-white/40">L: {round(d.day.mintemp_c)}°</span>
                  <span className="font-semibold">H: {round(d.day.maxtemp_c)}°</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      <ChatWidget
        weatherContext={{
          location: locationLabel,
          temp: round(current.temp_c),
          feelsLike: round(current.feelslike_c),
          condition: current.condition.text,
          high: round(today.day.maxtemp_c),
          low: round(today.day.mintemp_c),
        }}
      />
    </main>
  )
}
