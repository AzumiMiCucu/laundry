import { Sidebar } from "@/components/layout/Sidebar";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }) {
  const session = await auth();
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <Sidebar user={session?.user || null} />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
