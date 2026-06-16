/** Bandwidth helpers — keep hosting bills predictable on Vercel/Netlify. */

export function isHeroVideoEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_HERO_VIDEO?.trim().toLowerCase();
  if (flag === "false" || flag === "0") return false;
  /* Hero reel is ~4 MB after compression — on by default; set NEXT_PUBLIC_HERO_VIDEO=false to disable */
  return true;
}

export function shouldLoadHeroBackgroundVideo(options: {
  reduceMotion: boolean | null | undefined;
  saveData?: boolean;
}): boolean {
  if (!isHeroVideoEnabled()) return false;
  if (options.reduceMotion) return false;
  if (options.saveData) return false;
  return true;
}

export function mediaUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_MEDIA_CDN_URL?.trim().replace(/\/$/, "");
  if (!base || !path.startsWith("/")) return path;
  return `${base}${path}`;
}
