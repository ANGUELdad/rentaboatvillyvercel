import {
  Building2,
  Coins,
  Fuel,
  MapPin,
  MessageCircleQuestion,
  ShieldCheck,
  Ship,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export const FAQ_IMAGES = [
  "/images/boats/poseidon.jpg",
  "/images/boats/kima.jpg",
  "/images/boats/nikoleta.jpg",
  "/images/boats/poseidon-sea.jpg",
  "/images/boats/niki.jpg",
  "/images/boats/nikos.jpg",
  "/images/boats/ektoras.jpg",
  "/images/boats/basilios.jpg",
] as const;

export const FAQ_HIGHLIGHT_ICONS = [ShieldCheck, Building2, MapPin] as const;

export const FAQ_QUESTION_ICONS: LucideIcon[] = [
  MessageCircleQuestion,
  ShieldCheck,
  Coins,
  Fuel,
  MapPin,
  Wallet,
  Ship,
];

export const FAQ_DEFAULT_SLIDES = [
  {
    src: "/images/boats/poseidon-sea.jpg",
    caption: "Golden hour departure from Limenaria",
  },
  {
    src: "/images/boats/kima.jpg",
    caption: "Our boats on the Aegean",
  },
  {
    src: "/images/boats/nikoleta.jpg",
    caption: "Our Limenaria marina fleet",
  },
] as const;

export const HOME_FAQ_LIMIT = 8;
