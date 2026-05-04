import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ethara — Team Task Manager",
  description: "Plan, assign, and track work without the noise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
