import sanitizeHtml from "sanitize-html";

const BLOG_TAGS = [
  "h2",
  "h3",
  "p",
  "br",
  "strong",
  "em",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
] as const;

const BLOG_ATTRS: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "title", "rel", "target"],
};

/** Strip scripts, event handlers, and dangerous markup from blog HTML. */
export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [...BLOG_TAGS],
    allowedAttributes: BLOG_ATTRS,
    allowedSchemes: ["https", "mailto"],
    allowedSchemesByTag: { a: ["https", "mailto"] },
    disallowedTagsMode: "discard",
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}
