"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home,
  ShoppingBag,
  PlusCircle,
  User,
  LogOut,
  Waves,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/orders", label: "Pesanan", icon: ShoppingBag },
  { href: "/order/new", label: "Pesan", icon: PlusCircle },
  { href: "/profile", label: "Profil", icon: User },
];

/**
 * Customer navigation: top bar on desktop, bottom bar on mobile.
 * @param {{user?: {name?:string}|null}} props
 */
export function Navbar({ user }) {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <Waves className="h-5 w-5" />
            </span>
            <span>LaundryKu</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-slate-600 sm:inline">
                  Halo, {user.name?.split(" ")[0]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Keluar</span>
                </Button>
              </>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  Masuk
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs",
                  active ? "text-primary" : "text-slate-500",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
