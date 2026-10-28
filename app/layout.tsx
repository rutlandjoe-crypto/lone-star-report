import GsrNewsletterSignup from "./GsrNewsletterSignup";
import GsrAppLinks from "./GsrAppLinks";
import "./globals.css";
import type { Metadata } from "next";

const siteUrl = "https://www.gsrlonestarreport.com";
const description =
  "Statewide Texas news, politics, business, weather and sports built around journalistic integrity and journalist utility.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GSR Lone Star Report",
    template: "%s | GSR Lone Star Report",
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "GSR Lone Star Report",
    title: "GSR Lone Star Report",
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "GSR Lone Star Report",
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "NewsMediaOrganization",
      "@id": `${siteUrl}/#organization`,
      name: "GSR Lone Star Report",
      url: `${siteUrl}/`,
      description,
      areaServed: {
        "@type": "State",
        name: "Texas",
      },
      parentOrganization: {
        "@type": "Organization",
        name: "GSR Network",
        url: "https://gsrnetwork.io/",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "GSR Lone Star Report",
      url: `${siteUrl}/`,
      description,
      inLanguage: "en-US",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
    {
      "@type": "CollectionPage",
      "@id": `${siteUrl}/#homepage`,
      name: "GSR Lone Star Report",
      url: `${siteUrl}/`,
      description,
      isPartOf: {
        "@id": `${siteUrl}/#website`,
      },
      about: [
        "Texas news",
        "Texas politics",
        "Texas business",
        "Texas weather",
        "Texas sports",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4702397566533444"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>
        <script
          id="gsr-lone-star-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <GsrAppLinks source="lone-star" />
        {children}
        <GsrAppLinks source="lone-star" placement="footer" />
        <GsrNewsletterSignup />
      </body>
    </html>
  );
}