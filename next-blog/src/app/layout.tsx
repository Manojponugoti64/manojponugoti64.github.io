import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://manojponugoti64.github.io"),
  title: "Manoj's Blog",
  description:
    "Thoughts on technology, life, and everything in between — from Manoj Kumar.",
  openGraph: {
    title: "Manoj's Blog",
    description:
      "Thoughts on technology, life, and everything in between — from Manoj Kumar.",
    url: "https://manojponugoti64.github.io/",
    siteName: "Manoj's Blog",
    images: [{ url: "/assets/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={cormorant.variable}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
