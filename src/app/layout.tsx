import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Tabworthy",
    template: "%s | Tabworthy",
  },
  description:
    "The best channels on the internet, picked by people who actually watch them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Global Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Tabworthy
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Browse
              </Link>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="min-h-[calc(100vh-8rem)]">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Curated by humans, not algorithms.
              </p>
              <nav className="flex gap-4 text-sm text-muted-foreground">
                <Link href="#" className="transition-colors hover:text-foreground">
                  About
                </Link>
                <Link href="#" className="transition-colors hover:text-foreground">
                  Privacy
                </Link>
                <Link href="#" className="transition-colors hover:text-foreground">
                  Terms
                </Link>
              </nav>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
