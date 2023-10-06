import { Inter } from "next/font/google";
import Providers from "./Providers";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";
import { Toaster } from "@/components/Toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Barun Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} w-full`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
