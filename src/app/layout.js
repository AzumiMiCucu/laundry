import "./globals.css";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";

export const metadata = {
  title: "LaundryKu — Laundry Bersih, Hidup Lebih Ringan",
  description:
    "Layanan laundry antar-jemput: cuci kering lipat, express, setrika, dry clean, dan cuci sepatu.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-background antialiased">
        <SessionProvider>{children}</SessionProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
