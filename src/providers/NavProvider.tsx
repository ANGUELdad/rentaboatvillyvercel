"use client";

import { createContext, useContext } from "react";
import type { NavItem } from "@/types";

const NavContext = createContext<NavItem[]>([]);

export function NavProvider({
  items,
  children,
}: {
  items: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <NavContext.Provider value={items}>{children}</NavContext.Provider>
  );
}

export function useNavItems() {
  return useContext(NavContext);
}
