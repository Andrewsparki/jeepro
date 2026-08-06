import type { Metadata } from "next";
import { fontSans, fontMono } from "@/lib/fonts";
import { constructMetadata } from "@/lib/metadata";
import { Providers } from "@/providers";
import { CursorGlow } from "@/components/ui/cursor-glow";
import { EasterEgg } from "@/components/ui/easter-egg";
import "./globals.css";

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <CursorGlow />
        <EasterEgg />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
