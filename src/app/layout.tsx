import { Inter } from "next/font/google";
import Providers from "./Providers";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";
import { Toaster } from "@/components/Toaster";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });
const GTM_ID = "GTM-5L5C7VQ9";

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
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');
        `}
      </Script>
      <body className={`${inter.className} w-full`}>
        <Providers>{children}</Providers>
        <Toaster />
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />
      </body>
    </html>
  );
}
