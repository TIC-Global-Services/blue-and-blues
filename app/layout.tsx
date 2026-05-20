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
        {/* Google Tag Manager */}
        <script
          id="gtm-script"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];
              w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-TK3B9PGM');
            `,
          }}
        />

        {/* GTM NoScript */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TK3B9PGM"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
