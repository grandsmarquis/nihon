import type { Metadata } from "next";
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
    default: "infinihongo",
    template: "%s | infinihongo",
  },
  description: "A markdown-powered Japanese grammar reference for learners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="mt-auto border-t-2 border-foreground bg-background px-5 py-5 text-center text-sm text-stone-700">
          <a
            href="https://infiniwa.com"
            className="ukiyo-link font-semibold"
            rel="noreferrer"
            target="_blank"
          >
            made by infiniwa.com
          </a>
        </footer>
      </body>
    </html>
  );
}
