import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { RouteTracker } from "@/components/analytics/route-tracker";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    template: "%s | utllo",
    default: "utllo - Darmowe Narzędzia Online",
  },
  description:
    "Darmowe narzędzia online dla każdego. Generator haseł, odliczanie do wakacji, kalkulatory, konwertery i więcej. Wszystko działa w przeglądarce.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://utllo.com"
  ),
  keywords: [
    "narzędzia online",
    "darmowe narzędzia",
    "generator haseł",
    "odliczanie do wakacji",
    "kalkulator BMI",
    "konwerter PDF",
    "utllo",
    "online tools",
    "free tools",
  ],
  authors: [{ name: "utllo" }],
  creator: "utllo",
  publisher: "utllo",
  openGraph: {
    type: "website",
    locale: "pl_PL",
    alternateLocale: ["en_US"],
    siteName: "utllo",
    title: "utllo - Darmowe Narzędzia Online",
    description:
      "Darmowe narzędzia online dla każdego. Generator haseł, odliczanie do wakacji, kalkulatory, konwertery i więcej.",
    url: "https://utllo.com",
  },
  twitter: {
    card: "summary_large_image",
    site: "@utllo",
    creator: "@utllo",
    title: "utllo - Darmowe Narzędzia Online",
    description:
      "Darmowe narzędzia online dla każdego. Generator haseł, odliczanie do wakacji, kalkulatory, konwertery i więcej.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read locale from middleware header or detect from URL
  const headersList = await headers();
  const locale = headersList.get("x-locale") || "pl";

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <CookieBanner />
        <RouteTracker />
      </body>
    </html>
  );
}
