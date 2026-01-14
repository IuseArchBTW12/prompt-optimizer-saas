import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptFix - Optimize your AI prompts",
  description: "Optimize prompts for GPT-style LLMs with AI-powered suggestions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.NodeNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#09090b",
          colorInputBackground: "#000000",
          colorInputText: "#ffffff",
        },
        elements: {
          card: "bg-zinc-900 border border-zinc-800",
          headerTitle: "text-white",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 hover:bg-zinc-700",
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
          footerActionLink: "text-blue-500 hover:text-blue-400"
        }
      }}
    >
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className="antialiased bg-black text-white" suppressHydrationWarning>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
