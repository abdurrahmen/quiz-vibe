import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import CursorFollower from "@/components/CursorFollower";

export const metadata: Metadata = {
  title: "QuizVibe",
  description: "Challenge yourself with expertly crafted quizzes. Elevate your learning through engaging assessments and insightful analytics.",
  keywords: ["quiz", "learning", "education", "assessment", "knowledge"],
  authors: [{ name: "QuizVibe" }],
  openGraph: {
    title: "QuizVibe",
    description: "Test your knowledge with professionally crafted quizzes across hundreds of categories.",
    type: "website",
  },
};

import { Toaster } from 'react-hot-toast'
import NextTopLoader from 'nextjs-toploader'

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
      <body className="antialiased font-sans ">
        <NextTopLoader 
          showSpinner={true} 
          template='<div class="hidden" role="bar"><div class="peg"></div></div><div class="fixed! inset-0! z-9999! flex! items-center! justify-center! bg-surface/60 backdrop-blur-md transition-all duration-300" role="spinner"><div class="relative flex items-center justify-center animate-scale-in"><div class="absolute w-20 h-20 border-[3px] border-transparent border-t-primary border-b-primary rounded-full animate-spin [animation-duration:1.5s] [animation-timing-function:cubic-bezier(0.4,0,0.2,1)]"></div><div class="absolute w-14 h-14 border-[3px] border-transparent border-l-primary/50 border-r-primary/50 rounded-full animate-spin [animation-duration:2s] [animation-timing-function:cubic-bezier(0.4,0,0.2,1)] [animation-direction:reverse]"></div><span class="material-symbols-outlined filled text-primary text-[32px] animate-pulse drop-shadow-sm">school</span></div></div>'
        />
        <Toaster position="bottom-right" />
        <LenisProvider>
          <CursorFollower />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
