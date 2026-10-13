import 'leaflet/dist/leaflet.css';
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/src/components/footer";
import Header from "@/src/components/header";
import type { Metadata } from "next";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans"
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono"
});

export const metadata: Metadata = {
  description: "Finding plants for your area",
  title: "Planted It"
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
        <Footer />
      </body>
    </html>
  );
}
