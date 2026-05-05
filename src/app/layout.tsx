import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import CursorFollower from "@/components/CursorFollower";

export const metadata: Metadata = {
  title: "QuizMaster Pro",
  description: "Challenge yourself with expertly crafted quizzes. Elevate your learning through engaging assessments and insightful analytics.",
  keywords: ["quiz", "learning", "education", "assessment", "knowledge"],
  authors: [{ name: "QuizMaster Pro" }],
  openGraph: {
    title: "QuizMaster Pro",
    description: "Test your knowledge with professionally crafted quizzes across hundreds of categories.",
    type: "website",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans">
        <LenisProvider>
          <CursorFollower />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
