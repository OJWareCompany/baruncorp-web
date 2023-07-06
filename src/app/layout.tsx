import { Inter } from "next/font/google";
import Providers from "./providers";
import { Toaster } from "@/components/Toaster";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
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
