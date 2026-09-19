import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";

export const fontSans = localFont({
  src: [
    {
      path: "../Google Sans/GoogleSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../Google Sans/GoogleSans-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../Google Sans/GoogleSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../Google Sans/GoogleSans-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../Google Sans/GoogleSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../Google Sans/GoogleSans-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../Google Sans/GoogleSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../Google Sans/GoogleSans-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-google-sans",
  display: "swap",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica",
    "Arial",
    "sans-serif",
  ],
});

export const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

