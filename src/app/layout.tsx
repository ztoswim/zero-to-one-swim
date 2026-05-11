import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Dashboard | Zero To One Swim",
  description: "Zero To One Swim management system",
};

import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { getCurrentUserProfile } from "@/app/staff-access/actions";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if we are on the login page using headers (since we don't have middleware)
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || ""; 
  // Wait, x-pathname is only set if we have middleware. 
  // But we can check the URL in Server Components in a limited way? No.
  
  // Alternative: Fetch user. If null, and this is NOT a public route (we'll check inside the components)
  // Actually, let's just do it inside the Layout but skip for /login
  // But RootLayout wraps /login too!
  
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        <AuthenticatedLayout>
          {children}
        </AuthenticatedLayout>
      </body>
    </html>
  );
}
