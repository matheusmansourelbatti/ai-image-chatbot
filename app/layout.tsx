import type { ReactNode } from "react";

export const metadata = {
  title: "AI Image Chatbot",
  description: "Upload and search images using AI embeddings",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
