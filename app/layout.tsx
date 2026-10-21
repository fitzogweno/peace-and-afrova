import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "./components/AnnouncementBar";
import { AppProvider } from "./context/AppContext";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Peace and Afrova Group — Private Mauritius Experiences",
  description: "Bespoke private travel experiences in Mauritius. Curated tours, transfers, and tailor-made itineraries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <AppProvider>
          <AnnouncementBar />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}