"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Wrench,
  LogOut,
  Waves,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Order", icon: ShoppingBag },
  { href: "/admin/customers", label: "Pelanggan", icon: Users },
  { href: "/admin/services", label: "Layanan", icon: Wrench },
];

/**
 * Admin sidebar (desktop) + mobile drawer.
 * @param {{user?: {name?:string}|null}} props
 */
export function Sidebar({ user }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {LINKS.map((item) => {
        const Icon = item.icon;
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-white"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Waves className="h-4 w-4" />
          </span>
          Admin
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 hover:bg-slate-100"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-14 flex h-[calc(100%-3.5rem)] w-64 flex-col bg-white py-4 shadow-xl">
            {nav}
            <div className="px-3">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <LogOut className="h-5 w-5" />
                Keluar
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white py-5 lg:flex">
        <Link
          href="/admin/dashboard"
          className="mb-6 flex items-center gap-2 px-6 font-bold text-slate-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
            <Waves className="h-5 w-5" />
          </span>
          LaundryKu Admin
        </Link>
        {nav}
        <div className="mt-auto border-t border-slate-100 px-3 pt-4">
          <div className="mb-2 px-3 text-xs text-slate-400">
            {user?.name || "Admin"}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <LogOut className="h-5 w-5" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
