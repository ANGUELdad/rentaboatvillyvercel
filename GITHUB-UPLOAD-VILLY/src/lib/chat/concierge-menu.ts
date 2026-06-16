export interface ChatMenuOption {
  id: string;
  label: string;
  next: string;
}

export interface ChatMenuNode {
  message: string;
  options: ChatMenuOption[];
  link?: { href: string; label: string };
  links?: { href: string; label: string }[];
}

export type ChatMenuTree = Record<string, ChatMenuNode>;

export const START_MENU_GROUP_IDS = [
  "bookBoat",
  "ourBoats",
  "goodToKnow",
  "contact",
] as const;

/** Shown as compact chips before the grouped “More topics” menu. */
export const PRIMARY_START_OPTION_IDS = [
  "book",
  "fleet",
  "group",
  "contact",
] as const;

export type StartMenuGroupId = (typeof START_MENU_GROUP_IDS)[number];

export interface ChatMenuGroup {
  id: StartMenuGroupId;
  options: ChatMenuOption[];
}

const START_MENU_GROUP_OPTION_IDS: Record<StartMenuGroupId, string[]> = {
  bookBoat: ["book", "group"],
  ourBoats: ["fleet", "amenities"],
  goodToKnow: ["fuel", "directions"],
  contact: ["rates", "human", "contact"],
};

export function buildStartMenuGroups(options: ChatMenuOption[]): ChatMenuGroup[] {
  const byId = new Map(options.map((option) => [option.id, option]));

  return START_MENU_GROUP_IDS.map((id) => ({
    id,
    options: START_MENU_GROUP_OPTION_IDS[id]
      .map((optionId) => byId.get(optionId))
      .filter((option): option is ChatMenuOption => !!option),
  })).filter((group) => group.options.length > 0);
}

const NODE_KEYS = [
  "start",
  "booking",
  "fleet",
  "group",
  "directions",
  "fuel",
  "amenities",
  "rates",
  "contact",
  "human",
  "spots",
  "map",
  "safety",
  "pricing",
  "book-cta",
  "fleet-cta",
  "guide-cta",
  "map-cta",
  "package-cta",
] as const;

const NODE_LINKS: Record<
  string,
  { href: string; labelFrom?: "linkBook" | "linkFleet" | "linkGuide" | "linkMap" }
> = {
  "book-cta": { href: "/booking", labelFrom: "linkBook" },
  "fleet-cta": { href: "/fleet", labelFrom: "linkFleet" },
  "guide-cta": { href: "/guide", labelFrom: "linkGuide" },
  "map-cta": { href: "/map", labelFrom: "linkMap" },
};

export function extractChatMenuTree(
  chat: Record<string, unknown>,
  linkLabels: Partial<
    Record<
      "linkBook" | "linkFleet" | "linkGuide" | "linkMap" | "linkPackage",
      string
    >
  > = {},
): ChatMenuTree {
  const tree: ChatMenuTree = {};

  for (const key of NODE_KEYS) {
    const raw = chat[key];
    if (!raw || typeof raw !== "object" || !("message" in raw)) continue;

    const node = raw as ChatMenuNode;
    const options = Array.isArray(node.options)
      ? node.options.filter(
          (o): o is ChatMenuOption =>
            !!o &&
            typeof o === "object" &&
            typeof o.label === "string" &&
            typeof o.next === "string",
        )
      : [];

    if (!options.length) continue;

    const linkMeta = NODE_LINKS[key];
    const resolved: ChatMenuNode = {
      message: String(node.message),
      options,
      link: node.link,
      links: node.links,
    };

    if (linkMeta && !resolved.link) {
      const label = linkMeta.labelFrom
        ? (linkLabels[linkMeta.labelFrom] ?? linkMeta.href)
        : linkMeta.href;
      resolved.link = { href: linkMeta.href, label };
    }

    tree[key] = resolved;
  }

  return tree;
}

export function getMenuNode(
  tree: ChatMenuTree,
  nodeId: string,
): ChatMenuNode | null {
  return tree[nodeId] ?? tree.start ?? null;
}

export { menuThinkingDelayMs } from "@/lib/chat/concierge-dynamic";
