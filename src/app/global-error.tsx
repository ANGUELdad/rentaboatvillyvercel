"use client";

import { useEffect } from "react";
import { getEnglishDictionary } from "@/lib/i18n/dictionary";

const copy = getEnglishDictionary().errors.global;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[global-error]", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{copy.title} · Rent A Boat Villy</title>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(165deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)",
          color: "#e8f4fc",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "28rem",
            padding: "2.5rem 2rem",
            borderRadius: "1rem",
            border: "1px solid rgba(46, 232, 214, 0.15)",
            background: "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
              margin: "0 auto 1.25rem",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/villy-logo.png"
              alt="Rent A Boat Villy"
              width={160}
              height={141}
              style={{ height: "5rem", width: "auto", objectFit: "contain" }}
            />
          </div>
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              opacity: 0.55,
              margin: "0 0 0.75rem",
            }}
          >
            {copy.eyebrow}
          </p>
          <h1
            style={{
              fontSize: "1.375rem",
              fontWeight: 300,
              margin: "0 0 0.75rem",
              lineHeight: 1.3,
            }}
          >
            {copy.title}
          </h1>
          <p
            style={{
              maxWidth: "22rem",
              margin: "0 auto",
              opacity: 0.65,
              fontSize: "0.875rem",
              lineHeight: 1.6,
            }}
          >
            {copy.description}
          </p>
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "0.75rem 2rem",
                minHeight: "3rem",
                borderRadius: "0.75rem",
                border: "none",
                background: "#2ee8d6",
                color: "#0a1628",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9375rem",
                width: "100%",
                maxWidth: "14rem",
              }}
            >
              {copy.retry}
            </button>
            <a
              href="/"
              style={{
                padding: "0.75rem 2rem",
                minHeight: "3rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#e8f4fc",
                textDecoration: "none",
                fontSize: "0.9375rem",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                maxWidth: "14rem",
                boxSizing: "border-box",
              }}
            >
              {copy.home}
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
