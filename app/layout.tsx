import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "beans&toast 🫘🍞 – Fun AI Icon Prompt Generator",
  description:
    "A playful little kitchen for cooking up AI image prompts for 3D skeuomorphic icons in Airbnb's Lava design style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fredoka.variable}>
      <body className="lava-backdrop min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
