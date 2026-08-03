import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt =
  "Rent a boat Thassos — private boat rentals from New Port of Limenaria, Greece";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logoBytes = await readFile(
    join(process.cwd(), "public/brand/villy-logo.png"),
  );
  const logoSrc = `data:image/png;base64,${logoBytes.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background:
            "linear-gradient(145deg, #0c3258 0%, #145080 42%, #13a6aa 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Decorative horizon */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #ffd166, #ff8833, #66cc33)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt=""
            width={200}
            height={177}
            style={{ objectFit: "contain" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 58,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              textShadow: "0 4px 24px rgba(0,0,0,0.35)",
            }}
          >
            Rent A Boat Villy
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              color: "rgba(255,255,255,0.92)",
              lineHeight: 1.3,
            }}
          >
            Rent a boat in Thassos · New Port of Limenaria · Request booking
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 8,
            }}
          >
            {["Safety briefing", "No licence ≤30HP", "Secret coves"].map(
              (tag) => (
                <div
                  key={tag}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,209,102,0.45)",
                    color: "#ffd166",
                    fontSize: 20,
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </div>
              ),
            )}
          </div>
        </div>

        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.65)",
            fontWeight: 600,
          }}
        >
          www.rentaboatvilly.com
        </div>
      </div>
    ),
    { ...size },
  );
}
