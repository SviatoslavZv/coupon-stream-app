import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Archivo } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CouponCreek — Promo Codes & Deals for Top Fashion Stores",
    template: "%s | CouponCreek",
  },
  description:
    "Find verified promo codes and deals for your favorite fashion and apparel brands, updated daily.",
  openGraph: {
    title: "CouponCreek — Promo Codes & Deals for Top Fashion Stores",
    description:
      "Find verified promo codes and deals for your favorite fashion and apparel brands, updated daily.",
    url: siteUrl,
    siteName: "CouponCreek",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CouponCreek — Promo Codes & Deals for Top Fashion Stores",
    description:
      "Find verified promo codes and deals for your favorite fashion and apparel brands, updated daily.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      "impact-site-verification": "00cd0b44-49d1-40b5-9c5a-63d1826b9e41",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#E23E2F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID ?? "y3dnsl1xc5";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {gaId && <GoogleAnalytics gaId={gaId} />}
        {clarityId && (
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${clarityId}");
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}