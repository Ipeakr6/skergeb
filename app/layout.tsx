import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chris du geiler Ochse",
  description: "Alles Gute von Jonas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen antialiased bg-black">{children}</body>
    </html>
  );
}
