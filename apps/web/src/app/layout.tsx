import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OffKamp — Off-campus housing in Abuja",
  description: "Find off-campus accommodation near your campus in Abuja. Compare rooms, prices and facilities, then contact the lister directly.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakarta.variable} h-full antialiased`}>
      <body className="bg-white text-ink">{children}</body>
    </html>
  );
}