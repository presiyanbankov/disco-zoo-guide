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
import { ProgressProvider } from "../components/progress/ProgressProvider";
import "../styles/progress.css";
import { configuredSiteOrigin, pageMetadata } from "../components/seo/pageMetadata";
import { PROGRESS_STORAGE_KEY } from "../components/progress/spoilerPreferences";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...pageMetadata("Disco Zoo Guide & Rescue Assistant", "Find Disco Zoo rescue patterns and use the Rescue Assistant to choose your next tile. An unofficial guide with spoiler visibility controls.", "/"),
  metadataBase: configuredSiteOrigin(),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head><script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem(${JSON.stringify(PROGRESS_STORAGE_KEY)}))document.documentElement.dataset.spoilerRestoring="true"}catch{}` }} /></head>
      <body className="min-h-full flex flex-col"><ProgressProvider><EnvironmentLifecycle /><NavigationMotion>{children}</NavigationMotion></ProgressProvider></body>
    </html>
  );
}
