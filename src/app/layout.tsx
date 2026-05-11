import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";

import { ScaledViewport } from "@/components/ScaledViewport";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Valentia — Markets",
  description:
    "2560×1440 (16:9) scaled-viewport dashboard — fixed design rem + uniform transform scale",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ibmPlexMono.variable} h-full antialiased`}>
      <body>
        <ScaledViewport>{children}</ScaledViewport>
      </body>
    </html>
  );
}
