import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { RouteTransitionIndicator } from "@/components/ui/route-transition-indicator";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Kinaadman",
    template: "%s | Kinaadman",
  },
  description:
    "Campus-only thesis and capstone repository for universities, built around archival clarity and tenant isolation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${newsreader.variable}`}>
        <Providers>
          <RouteTransitionIndicator />
          {children}
        </Providers>
      </body>
    </html>
  );
}
