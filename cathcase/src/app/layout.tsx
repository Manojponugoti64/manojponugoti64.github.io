import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/header";
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
  title: "CathLab Mentor — Learn the move before the wire",
  description:
    "Source-linked interactive cath-lab cases and an anatomy atlas for cardiology trainees.",
  openGraph: {
    title: "CathLab Mentor",
    description: "Practice cath-lab decisions before the wire",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-card-border py-6 text-center text-xs text-muted">
          CathLab Mentor · Educational workspace · Not a substitute for supervised clinical judgment
        </footer>
      </body>
    </html>
  );
}
