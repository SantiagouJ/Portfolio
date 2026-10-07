import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";

const sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Santiago Jurado",
  description: "Portfolio of Santiago Jurado, full-stack developer and UX/UI.",
};

export const viewport: Viewport = {
  themeColor: "#f1f0eb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="design" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        <Script id="mode-boot" strategy="beforeInteractive">
          {`try{var m=localStorage.getItem("dm-mode");if(m==="dev"||m==="design")document.documentElement.setAttribute("data-mode",m);}catch(e){}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
