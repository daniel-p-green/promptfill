import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptFill",
  description: "Save your best prompts, fill in the details, and copy polished results fast.",
  themeColor: "#f4f2ec",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
