import type { Metadata } from "next";
import "./globals.css";
import { ClashDisplay } from "@/fonts";
import Navbar from "@/components/Reusable/Navbar";
import Footer from "@/components/Reusable/Footer";


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
        className={`${ClashDisplay.variable} antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
