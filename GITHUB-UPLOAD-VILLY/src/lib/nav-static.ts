import navData from "../../data/nav.json";
import type { NavData } from "@/types";

/** Bundled nav for client-safe layouts (error pages). */
export const STATIC_NAV: NavData = {
  items: navData.items.filter((item) => item.enabled !== false),
};
