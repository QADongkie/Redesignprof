import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tl-mabuhay-road-to-ready.marietankarla.chatgpt.site"),
  title: "TL Mabuhay Driving Lesson Academy | Your Defensive Driving Advocate",
  description:
    "Professional theoretical and practical driver training from an LTO-accredited driving school with 147 branches across 8 regions.",
  icons: {
    icon: "/assets/tl-mabuhay-logo-exact.svg",
    shortcut: "/assets/tl-mabuhay-logo-exact.svg",
  },
  openGraph: {
    title: "TL Mabuhay | Your Defensive Driving Advocate",
    description: "Learn with discipline. Practice with purpose. Drive with confidence.",
    type: "website",
    images: [{
      url: "/og.png",
      width: 1536,
      height: 1024,
      alt: "TL Mabuhay — Your Defensive Driving Advocate.",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TL Mabuhay | Your Defensive Driving Advocate",
    description: "Learn with discipline. Practice with purpose. Drive with confidence.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="codex-preview" content="development" />
      </head>
      <body>{children}</body>
    </html>
  );
}
