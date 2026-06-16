export interface ContentRowItem {
  id: string;
  title: string;
  image: string;
  href?: string;
  /** Secondary line — tagline, excerpt, category */
  subtitle?: string;
  /** Compact spec chips shown in the glass footer */
  specs?: string[];
  /** Optional top-left badge */
  badge?: string;
}

export type ContentRowSize = "compact" | "default" | "large";
