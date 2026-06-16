import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/seo/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Villy",
    description:
      "Rent a boat in Thassos from New Port of Limenaria — private speedboats and day boat rentals. Request a booking online.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c2d3a",
    theme_color: "#0d9488",
    orientation: "portrait-primary",
    lang: "en",
    categories: ["travel", "lifestyle"],
    icons: [
      {
        src: "/brand/villy-logo.png",
        sizes: "577x410",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    related_applications: [],
    scope: "/",
    id: "/",
  };
}
