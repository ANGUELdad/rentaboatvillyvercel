"use client";

import { OfferPopup } from "./OfferPopup";
import type { Offer } from "@/types";

export function OfferPopupWrapper({ offers }: { offers: Offer[] }) {
  return <OfferPopup offers={offers} />;
}
