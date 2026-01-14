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
              colorInputBackground: "#27272a",
              colorInputText: "#ffffff",
              colorText: "#ffffff",
              colorTextSecondary: "#d4d4d8",
              colorDanger: "#ef4444",
              borderRadius: "0.5rem",
              fontSize: "0.875rem"
            },
            elements: {
              rootBox: "w-full",
              card: "bg-zinc-900 border-2 border-zinc-700 shadow-2xl",
              navbar: "bg-zinc-800 border-b border-zinc-700",
              navbarButton: "text-zinc-200 hover:text-white font-medium",
              navbarButtonActive: "text-white bg-zinc-700 font-bold",
              headerTitle: "text-white text-2xl font-bold",
              headerSubtitle: "text-zinc-300",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg py-3",
              formButtonSecondary: "bg-zinc-700 hover:bg-zinc-600 text-white font-semibold border-2 border-zinc-600",
              formFieldLabel: "text-zinc-200 font-semibold mb-2",
              formFieldInput: "bg-zinc-800 border-2 border-zinc-600 text-white placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 py-3 px-4",
              profileSectionTitle: "text-white font-bold text-lg",
              profileSectionContent: "text-zinc-200",
              profileSectionPrimaryButton: "bg-blue-600 hover:bg-blue-700 text-white font-bold",
              accordionTriggerButton: "text-white hover:text-zinc-200 font-medium",
              formHeaderTitle: "text-white text-xl font-bold",
              formHeaderSubtitle: "text-zinc-300",
              badge: "bg-blue-600 text-white font-semibold",
              avatarBox: "border-2 border-zinc-600",
              selectButton: "bg-zinc-800 border-2 border-zinc-600 text-white",
              selectOptionsContainer: "bg-zinc-800 border-2 border-zinc-600",
              selectOption: "text-white hover:bg-zinc-700",
              modalBackdrop: "bg-black/80",
              modalContent: "bg-zinc-900 border-2 border-zinc-700"
            }
          }}
        />
      </main>
    </div>
  );
}
