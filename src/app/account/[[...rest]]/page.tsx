"use client";

import { UserProfile } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold cursor-pointer">PromptFix</h1>
          </Link>
          <div className="flex gap-4">
            <Link href="/app">
              <Button variant="ghost">Optimize</Button>
            </Link>
            <Link href="/history">
              <Button variant="outline">History</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 flex justify-center">
        <UserProfile
          path="/account"
          routing="path"
          appearance={{
            variables: {
              colorPrimary: "#3b82f6",
              colorBackground: "#18181b",
              colorInputBackground: "#09090b",
              colorInputText: "#ffffff",
              colorText: "#ffffff",
              colorTextSecondary: "#a1a1aa",
              colorDanger: "#ef4444",
              borderRadius: "0.5rem"
            },
            elements: {
              rootBox: "w-full",
              card: "bg-zinc-900 border-2 border-zinc-700 shadow-2xl",
              navbar: "bg-zinc-800",
              navbarButton: "text-zinc-300 hover:text-white",
              navbarButtonActive: "text-white bg-zinc-700",
              headerTitle: "text-white text-2xl font-bold",
              headerSubtitle: "text-zinc-400",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-semibold",
              formFieldLabel: "text-zinc-300 font-medium",
              formFieldInput: "bg-black border-2 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500",
              profileSectionTitle: "text-white",
              profileSectionContent: "text-zinc-300",
              accordionTriggerButton: "text-white hover:text-zinc-300",
              formHeaderTitle: "text-white",
              formHeaderSubtitle: "text-zinc-400"
            }
          }}
        />
      </main>
    </div>
  );
}
