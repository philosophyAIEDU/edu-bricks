import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Edu Bricks",
  description: "Re-imagine any website in seconds with AI-powered educational website builder.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  shrinkToFit: 'no',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
