import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ title, children }: { title: string; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 min-w-0">
        <Header title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
