import { NextResponse } from 'next/server'

const weatherCoords: Record<string, { lat: number, lon: number }> = {
  'mauritius': { lat: -20.1619, lon: 57.4989 },
  'rodrigues': { lat: -19.6833, lon: 63.4167 },
  'reunion': { lat: -20.8823, lon: 55.4504 },
  'seychelles': { lat: -4.6231, lon: 55.4522 }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')

    const coords = slug ? weatherCoords[slug] : null
    // MUST use the non-public key here. We will rename it in Vercel.
    const apiKey = process.env.OPENWEATHER_API_KEY 

    if (!coords) return NextResponse.json({ error: 'Invalid destination' }, { status: 400 })
    if (!apiKey) return NextResponse.json({ error: 'Weather API key not configured' }, { status: 500 })

    // Using the forecast endpoint to get 'pop' (Probability of Precipitation)
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${apiKey}&cnt=1`,
      { next: { revalidate: 1800 } } // Cache for 30 minutes to save API calls
    )
    
    const data = await res.json()
    
    if (!data.list || data.list.length === 0) throw new Error("No weather data found")
    
    const current = data.list[0]

    return NextResponse.json({
      temp: current.main.temp,
      description: current.weather[0].description,
      main: current.weather[0].main,
      humidity: current.main.humidity,
      wind: current.wind.speed,
      pop: current.pop // Probability of precipitation (0 to 1)
    })
  } catch (error: any) {
    console.error("WEATHER API ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}