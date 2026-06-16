import { isAllowedCoverImage } from "./validate";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isNonEmptyString(v: unknown, max = 500): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max;
}

export function validateDataFile(
  file: string,
  body: unknown,
): { ok: true } | { ok: false; error: string } {
  switch (file) {
    case "boats": {
      if (!Array.isArray(body)) {
        return { ok: false, error: "boats.json must be an array" };
      }
      for (const item of body) {
        if (!isRecord(item)) return { ok: false, error: "Invalid boat entry" };
        if (!isNonEmptyString(item.id, 64)) {
          return { ok: false, error: "Each boat needs a valid id" };
        }
        if (!isNonEmptyString(item.name, 120)) {
          return { ok: false, error: "Each boat needs a name" };
        }
        if (typeof item.pax !== "number" || item.pax < 1 || item.pax > 50) {
          return { ok: false, error: "Boat pax must be 1–50" };
        }
        if (
          typeof item.pricePerHour !== "number" ||
          item.pricePerHour < 0 ||
          item.pricePerHour > 10_000
        ) {
          return { ok: false, error: "Invalid pricePerHour" };
        }
        if (
          typeof item.image === "string" &&
          item.image &&
          !isAllowedCoverImage(item.image)
        ) {
          return { ok: false, error: "Boat images must be /images/ or images.unsplash.com" };
        }
        if (Array.isArray(item.gallery)) {
          for (const url of item.gallery) {
            if (typeof url === "string" && url && !isAllowedCoverImage(url)) {
              return { ok: false, error: "Gallery images must be /images/ or images.unsplash.com" };
            }
          }
        }
      }
      return { ok: true };
    }

    case "faq": {
      if (!Array.isArray(body)) {
        return { ok: false, error: "faq.json must be an array" };
      }
      for (const item of body) {
        if (!isRecord(item)) return { ok: false, error: "Invalid FAQ entry" };
        if (!isNonEmptyString(item.id, 64) || !isNonEmptyString(item.question, 500)) {
          return { ok: false, error: "Each FAQ needs id and question" };
        }
        if (!isNonEmptyString(item.answer, 5000)) {
          return { ok: false, error: "Each FAQ needs an answer" };
        }
      }
      return { ok: true };
    }

    case "legal": {
      if (!isRecord(body) || !isRecord(body.company)) {
        return { ok: false, error: "legal.json needs a company object" };
      }
      for (const key of ["privacy", "cookies", "terms", "gdpr"] as const) {
        const doc = body[key];
        if (!isRecord(doc) || !isNonEmptyString(doc.title, 200)) {
          return { ok: false, error: `legal.json missing valid ${key} section` };
        }
      }
      return { ok: true };
    }

    case "offers": {
      if (!isRecord(body) || !Array.isArray(body.offers)) {
        return { ok: false, error: "offers.json needs an offers array" };
      }
      for (const offer of body.offers) {
        if (!isRecord(offer) || !isNonEmptyString(offer.id, 64)) {
          return { ok: false, error: "Each offer needs an id" };
        }
      }
      return { ok: true };
    }

    case "nav": {
      if (!isRecord(body) || !Array.isArray(body.items)) {
        return { ok: false, error: "nav.json must have an items array" };
      }
      for (const item of body.items) {
        if (!isRecord(item)) return { ok: false, error: "Invalid nav item" };
        if (!isNonEmptyString(item.id, 64)) {
          return { ok: false, error: "Each nav item needs an id" };
        }
        if (!isNonEmptyString(item.href, 120)) {
          return { ok: false, error: "Each nav item needs an href" };
        }
        if (!isNonEmptyString(item.labelKey, 32)) {
          return { ok: false, error: "Each nav item needs a labelKey" };
        }
      }
      return { ok: true };
    }

    case "gallery": {
      if (!isRecord(body) || !Array.isArray(body.items)) {
        return { ok: false, error: "gallery.json must have an items array" };
      }
      if (body.items.length > 40) {
        return { ok: false, error: "Gallery limited to 40 items" };
      }
      for (const item of body.items) {
        if (!isRecord(item)) return { ok: false, error: "Invalid gallery item" };
        if (!isNonEmptyString(item.id, 64)) {
          return { ok: false, error: "Each gallery item needs an id" };
        }
        if (item.type !== "image" && item.type !== "video") {
          return { ok: false, error: "Gallery type must be image or video" };
        }
        if (!isNonEmptyString(item.src, 500)) {
          return { ok: false, error: "Each gallery item needs a src URL" };
        }
      }
      return { ok: true };
    }

    default:
      return { ok: false, error: "Unknown file" };
  }
}
