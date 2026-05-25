import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? 'auto:ip'

  const res = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHERAPI_KEY}&q=${encodeURIComponent(q)}&days=3&aqi=no&alerts=no`,
    { next: { revalidate: 600 } }
  )

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    return Response.json(
      { error: 'WeatherAPI error', detail: body?.error?.message ?? res.statusText },
      { status: res.status }
    )
  }

  return Response.json(await res.json())
}
