"use client";

import Script from "next/script";
import { useConsentCategory } from "@/hooks/useConsentCategory";

const GOOGLE_ADS_ID = "AW-18244174841";

export function ConsentGatedScripts() {
  const { marketing } = useConsentCategory();

  if (!marketing) return null;

  return (
    <>
      <Script
        id="google-ads-gtag-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}
