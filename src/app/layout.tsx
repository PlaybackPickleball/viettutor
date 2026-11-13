import type { Metadata } from "next";
import { Be_Vietnam_Pro, Fraunces, Mali } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const sans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600"],
});

/** Vietnamese-supporting handwritten style for the Write studio */
const hand = Mali({
  variable: "--font-hand",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ÁMi Lingua — Level 1 Learning Studio",
  description:
    "Patient AI tutor for Southern Vietnamese: hear, say, write, and link sound to meaning — mastery before advance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} ${hand.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
