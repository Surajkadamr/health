import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import { cn } from "@/lib/utils"; // Assuming alias is set up in jsconfig.json or tsconfig.json
// import { ThemeProvider } from "@/components/ThemeProvider"; // Assuming alias

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Added for font display strategy
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap', // Added for font display strategy
});

export const metadata = {
  title: "HealthViz - AI Health Report Analyzer", // Updated title
  description: "Upload your PDF health report and get an AI-powered summary and dashboard.", // Updated description
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        // className={cn(
        //   "min-h-screen bg-background font-sans antialiased", // bg-background and font-sans from Tailwind/ShadCN
        // geistSans.variable,
        // geistMono.variable
        // )}
        // It's better to apply font variables directly or via global CSS
        style={{ fontFamily: `var(${geistSans.variable}), var(${geistMono.variable})` }}
      >
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        > */}
          {children}
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
