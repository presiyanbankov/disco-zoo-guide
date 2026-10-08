import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/regions.css";
import "../styles/animals.css";
import "../styles/responsive.css";
import "../styles/motion.css";
import "../styles/environment.css";
import "../styles/rescue.css";
import "../styles/alpha09.css";
import "../styles/pets.css";
import "../styles/strategies.css";
import { NavigationMotion } from "../components/navigation/NavigationMotion";
import { EnvironmentLifecycle } from "../components/effects/EnvironmentLifecycle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Disco Zoo Field Guide — Your next great rescue",
  description: "An unofficial Disco Zoo companion. Explore Farm, Outback, Savanna, Northern, Polar, Jungle and Moon with animal patterns and search sequences.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><EnvironmentLifecycle /><NavigationMotion>{children}</NavigationMotion></body>
    </html>
  );
}
