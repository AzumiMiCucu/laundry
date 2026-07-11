import Link from "next/link";
import { Waves } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 text-xl font-bold text-slate-900"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <Waves className="h-6 w-6" />
          </span>
          LaundryKu
        </Link>
        {children}
      </div>
    </div>
  );
}
