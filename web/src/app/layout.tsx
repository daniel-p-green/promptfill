import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptFill Studio",
  description: "Design, fill, and share reusable prompts with guided onboarding and polished UX.",
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
