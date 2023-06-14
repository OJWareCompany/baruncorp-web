import { Inter } from "next/font/google";
import "./globals.css";
import AuthContext from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });
export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};
import { Toaster } from "@/components/Toaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} w-full`}>
        <AuthContext>{children}</AuthContext>
        <Toaster />
      </body>
    </html>
  );
}
