import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "./components/Sidebar";
import SessionProvider from "./providers/SessionProvider";

import { ThemeProvider } from "./components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The AI/DE Nexus — Data Engineering Knowledge Base",
  description: "A centralized knowledge base for Data Engineering, Machine Learning, and programming — notes, cheatsheets, and exercises by Omar Emara.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ThemeProvider>
          <SessionProvider>
          <Sidebar />
          <main className="md:pl-56 min-h-screen">
            {children}
          </main>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
