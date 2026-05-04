import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Dashboard | Zero To One Swim",
  description: "Zero To One Swim management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        <div className="min-h-screen flex">
          <Navigation />
          <main className="flex-1 flex flex-col relative min-w-0">
            <div className="flex-1 overflow-y-auto w-full px-4 py-6 md:px-8 md:py-8 bg-gray-50 pb-24 h-screen">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
