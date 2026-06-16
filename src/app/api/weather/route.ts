import { NextResponse } from "next/server";
import { LIMENARIA_MARINA } from "@/lib/map-geo";

const OPEN_METEO =
  "https://api.open-meteo.com/v1/forecast";

function seaStateFromWindKmh(wind: number): "calm" | "moderate" | "rough" {
  if (wind < 12) return "calm";
  if (wind < 22) return "moderate";
  return "rough";
}

export async function GET() {
  const { lat, lng } = LIMENARIA_MARINA.coordinates;
  const url = new URL(OPEN_METEO);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m");
  url.searchParams.set("timezone", "Europe/Athens");

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 1800 },
    });
    if (!res.ok) throw new Error("weather upstream failed");
    const data = (await res.json()) as {
      current?: {
        temperature_2m?: number;
        weather_code?: number;
        wind_speed_10m?: number;
      };
    };
    const temp = Math.round(data.current?.temperature_2m ?? 26);
    const wind = data.current?.wind_speed_10m ?? 8;
    const code = data.current?.weather_code ?? 0;
    const sunny = code <= 1;

    return NextResponse.json({
      tempC: temp,
      windKmh: Math.round(wind),
      seaState: seaStateFromWindKmh(wind),
      sunny,
      location: "Thassos",
    });
  } catch {
    return NextResponse.json({
      tempC: 26,
      windKmh: 8,
      seaState: "calm" as const,
      sunny: true,
      location: "Thassos",
      fallback: true,
    });
  }
}
