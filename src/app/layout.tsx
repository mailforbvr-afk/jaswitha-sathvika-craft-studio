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
  title: "Jaswitha & Sathvika Little Craft Studio | Handmade Creations",
  description:
    "Explore handmade bracelets, flowers, bouquets, keychains, magnets and creative crafts by Jaswitha & Sathvika.",
  metadataBase: new URL("https://little-craft-studio.pages.dev"),
  openGraph: {
    title: "Jaswitha & Sathvika Little Craft Studio | Handmade Creations",
    description:
      "Explore handmade bracelets, flowers, bouquets, keychains, magnets and creative crafts by Jaswitha & Sathvika.",
    type: "website",
    locale: "en_IN",
    siteName: "Jaswitha & Sathvika Little Craft Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jaswitha & Sathvika Little Craft Studio | Handmade Creations",
    description:
      "Explore handmade bracelets, flowers, bouquets, keychains, magnets and creative crafts by Jaswitha & Sathvika.",
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
