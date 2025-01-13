import "./globals.css";
import Footer from "@/components/Footer";

import Navbar from "@/components/NavBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar />
        <main className="w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
