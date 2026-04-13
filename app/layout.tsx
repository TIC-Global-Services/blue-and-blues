import type { Metadata } from "next";
import "./globals.css";
import { ClashDisplay } from "@/fonts";
import Navbar from "@/components/Reusable/Navbar";
import Footer from "@/components/Reusable/Footer";
import {Inter} from "next/font/google";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: "Blue & Blues",
  description: "The most meaningful gifts aren't always the ones people ask for — they're the ones that quietly make everyday life better. That's the difference. Blue & Blues.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ClashDisplay.variable} ${inter.variable} antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
