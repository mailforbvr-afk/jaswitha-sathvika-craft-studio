import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Little Arts | Handmade with Love",
  description:
    "Little hands • Big imagination • Handmade with love. Explore handmade crafts by Jaswitha & Sathvika.",
  metadataBase: new URL("https://littlearts.mailforbvr.workers.dev"),
  openGraph: {
    title: "Little Arts | Handmade with Love",
    description:
      "Little hands • Big imagination • Handmade with love. Explore handmade crafts by Jaswitha & Sathvika.",
    type: "website",
    locale: "en_IN",
    siteName: "Little Arts",
  },
  twitter: {
    card: "summary_large_image",
    title: "Little Arts | Handmade with Love",
    description:
      "Little hands • Big imagination • Handmade with love. Explore handmade crafts by Jaswitha & Sathvika.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${fredoka.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
