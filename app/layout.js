import { Geist, Geist_Mono } from "next/font/google";
import ThemeProvider from "@/components/ui/ThemeProvider"; // Import ThemeProvider;
import TokenRefresher from "@/components/utils/TokenRefresher";

import "./globals.css";
import ReduxProvider from "./redux/ReduxProvider";
import { Metadata } from "next";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <ThemeProvider>
          <TokenRefresher/>
            {children}</ThemeProvider> {/* Wrap with ThemeProvider */}
          </ReduxProvider>
      </body>
    </html>
  );
}
