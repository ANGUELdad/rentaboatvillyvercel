import { redirect } from "next/navigation";

/** Price calculator removed — send legacy /package links to booking. */
export default function PackagePage() {
  redirect("/booking");
}
