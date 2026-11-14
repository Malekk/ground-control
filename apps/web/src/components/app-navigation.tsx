"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { isActiveItem, navigationItems } from "@/lib/navigation";

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="flex items-center gap-2 border-b bg-sidebar px-4 py-3 md:w-56 md:flex-col md:items-stretch md:border-r md:border-b-0 md:py-6"
    >
      <Link href="/" className="mr-4 px-2 font-semibold md:mr-0 md:mb-6">
        Ground Control
      </Link>
      {navigationItems.map((item) => {
        const active = isActiveItem(item, pathname);
        return (
          <Button
            key={item.href}
            asChild
            variant={active ? "secondary" : "ghost"}
            className="md:justify-start"
          >
            <Link href={item.href} aria-current={active ? "page" : undefined}>
              {item.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
