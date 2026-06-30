import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "IT Connect Matrimony - Find Your Perfect Match in Tech",
  description:
    "A premium matrimony platform for IT professionals. Find your perfect tech match with smart compatibility matching based on tech stack, career aspirations, and values.",
  keywords: [
    "matrimony",
    "IT professionals",
    "tech matchmaking",
    "software engineer matrimony",
    "IT connect",
  ],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: { url: "/logo.svg", type: "image/svg+xml" },
    other: [{ rel: "apple-touch-icon", url: "/logo.svg" }],
  },
  openGraph: {
    title: "IT Connect Matrimony",
    description: "Find your perfect tech match",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "IT Connect Matrimony",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IT Connect Matrimony",
    description: "Find your perfect tech match",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
