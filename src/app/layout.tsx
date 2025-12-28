import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bengali",
});

export const metadata: Metadata = {
  title: "তারুণ্যের ঠিকানা Blood Bank | রক্তদান করুন, জীবন বাঁচান",
  description:
    "বাংলাদেশের সবচেয়ে বড় রক্তদান প্ল্যাটফর্ম। জরুরি রক্তের প্রয়োজনে আমরা আপনার পাশে। Donate blood, save lives.",
  keywords: [
    "blood donation",
    "রক্তদান",
    "Bangladesh",
    "বাংলাদেশ",
    "blood bank",
    "রক্ত ব্যাংক",
    "emergency blood",
    "জরুরি রক্ত",
  ],
  authors: [{ name: "তারুণ্যের ঠিকানা" }],
  openGraph: {
    title: "তারুণ্যের ঠিকানা Blood Bank",
    description: "রক্তদান করুন, জীবন বাঁচান",
    type: "website",
    locale: "bn_BD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className={`${hindSiliguri.variable} font-bengali antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}




