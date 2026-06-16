import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0c3258 0%, #145080 55%, #13a6aa 100%)",
          borderRadius: 36,
        }}
      >
        <svg
          width="112"
          height="112"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M32 14v22" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M20 48a6 6 0 0 1-6-6 1.5 1.5 0 0 1 1.5-1.5h33A1.5 1.5 0 0 1 50 42a6 6 0 0 1-6 6H20z"
            fill="#ffffff"
            opacity="0.92"
          />
          <path
            d="M24 18.5a1.5 1.5 0 0 1 2.28-.29l18 16.2A1.5 1.5 0 0 1 43 38H21a1.5 1.5 0 0 1-1.24-2.35l4.24-17.15z"
            fill="#66cc33"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
