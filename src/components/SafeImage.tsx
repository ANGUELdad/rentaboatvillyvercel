"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

const FALLBACK = "/images/boats/poseidon.jpg";

export function SafeImage(props: ImageProps) {
  const [src, setSrc] = useState(props.src);
  const failedOnce = useRef(false);

  useEffect(() => {
    setSrc(props.src);
    failedOnce.current = false;
  }, [props.src]);

  return (
    <Image
      {...props}
      src={src}
      onError={() => {
        if (failedOnce.current) return;
        failedOnce.current = true;
        if (src !== FALLBACK) setSrc(FALLBACK);
      }}
    />
  );
}
