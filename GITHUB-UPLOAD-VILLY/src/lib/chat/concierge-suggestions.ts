import type { ChatMenuOption, ChatMenuTree } from "@/lib/chat/concierge-menu";

const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");

/** Maps common brain / locale suggestion phrases to start-menu option ids. */
const SUGGESTION_OPTION_IDS: Record<string, string> = {
  "request availability": "book",
  "request pricing": "rates",
  "which boat for my group?": "group",
  "our fleet": "fleet",
  "fuel policy": "fuel",
  "what's included?": "amenities",
  "what's included": "amenities",
  "what's included on boats": "amenities",
  "how to get to limenaria": "directions",
  "how to get to limenaria marina": "directions",
  "call us": "contact",
  "safety rules": "safety",
  "no licence needed?": "group",
  διαθεσιμότητα: "book",
  "αίτημα προσφοράς": "rates",
  "ποια βάρκα για την ομάδα μου;": "group",
  στόλος: "fleet",
  "πολιτική καυσίμων": "fuel",
  "τι περιλαμβάνεται;": "amenities",
  "τι περιλαμβάνεται στα βάρκες": "amenities",
  "πώς φτάνω στη λιμενάρια": "directions",
  "πώς φτάνω στο νέο λιμάνι λιμεναρίων": "directions",
  κλήση: "contact",
  "κανόνες ασφαλείας": "safety",
  "χωρίς άδεια;": "group",
};

function findByLabel(tree: ChatMenuTree, suggestion: string): ChatMenuOption | null {
  const norm = normalize(suggestion);

  for (const node of Object.values(tree)) {
    const exact = node.options.find((o) => normalize(o.label) === norm);
    if (exact) return exact;
  }

  for (const node of Object.values(tree)) {
    const partial = node.options.find((o) => {
      const label = normalize(o.label);
      return label.includes(norm) || norm.includes(label);
    });
    if (partial) return partial;
  }

  return null;
}

/** Resolve a suggestion chip to a menu option when possible (deep-link into menu tree). */
export function findMenuOptionForSuggestion(
  tree: ChatMenuTree,
  suggestion: string,
): ChatMenuOption | null {
  const byLabel = findByLabel(tree, suggestion);
  if (byLabel) return byLabel;

  const optionId = SUGGESTION_OPTION_IDS[normalize(suggestion)];
  if (!optionId) return null;

  const startOptions = tree.start?.options ?? [];
  return startOptions.find((o) => o.id === optionId) ?? null;
}
