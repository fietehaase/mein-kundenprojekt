import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Management System",
  description: "Planung und Steuerung von Events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
