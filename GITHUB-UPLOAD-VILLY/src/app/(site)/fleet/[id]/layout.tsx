/** Boat detail uses its own in-page header — drop main top padding */
export default function BoatDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="-mt-16 sm:-mt-[4.5rem]">{children}</div>;
}
