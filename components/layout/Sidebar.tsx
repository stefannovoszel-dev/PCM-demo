"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Blocks,
  ClipboardList,
  Database,
  FileJson,
  Gauge,
  GitBranch,
  Home,
  ListChecks,
  Network,
  PackageSearch,
  PlayCircle,
  Sparkles
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const icons = [
  Home,
  Blocks,
  Gauge,
  PackageSearch,
  Network,
  Database,
  GitBranch,
  Sparkles,
  FileJson,
  PlayCircle,
  ClipboardList
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Activity className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Product Compliance</p>
          <p className="truncate text-xs text-muted-foreground">Management Demo</p>
        </div>
      </div>
      <nav className="thin-scrollbar flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item, index) => {
          const Icon = icons[index] ?? ListChecks;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950",
                active && "bg-blue-50 text-blue-700"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <div className="rounded-lg border bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Scenario</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">PPWR · Sparkling Water 1L</p>
          <p className="mt-1 text-xs text-slate-500">Germany / DE · PKG-7781</p>
        </div>
      </div>
    </aside>
  );
}
