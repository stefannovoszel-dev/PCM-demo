"use client";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { DemoStateProvider } from "@/lib/demo-state";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <DemoStateProvider>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="lg:pl-72">
          <TopBar />
          <main className="px-4 py-6 lg:px-6">{children}</main>
        </div>
      </div>
    </DemoStateProvider>
  );
}
