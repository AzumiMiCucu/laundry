import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { auth } from "@/lib/auth";

export default async function CustomerLayout({ children }) {
  const session = await auth();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={session?.user || null} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
    </div>
  );
}
