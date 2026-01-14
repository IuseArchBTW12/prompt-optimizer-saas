import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black flex items-center justify-center p-4">
      <SignIn
        afterSignInUrl="/app"
        redirectUrl="/app"
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
            rootBox: "mx-auto",
            card: "bg-zinc-900 border-2 border-zinc-700 shadow-2xl",
            headerTitle: "text-white text-2xl font-bold",
            headerSubtitle: "text-zinc-300",
            socialButtonsBlockButton: "bg-zinc-700 border-2 border-zinc-600 hover:bg-zinc-600 text-white shadow-lg",
            socialButtonsBlockButtonText: "text-white font-semibold",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg py-3",
            formFieldLabel: "text-zinc-200 font-semibold mb-2",
            formFieldInput: "bg-zinc-800 border-2 border-zinc-600 text-white placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 py-3 px-4",
            footerActionLink: "text-blue-400 hover:text-blue-300 font-semibold underline",
            formFieldInputShowPasswordButton: "text-zinc-300 hover:text-white",
            identityPreviewText: "text-white font-medium",
            formHeaderTitle: "text-white text-xl font-bold",
            formHeaderSubtitle: "text-zinc-300",
            dividerLine: "bg-zinc-600",
            dividerText: "text-zinc-300",
            otpCodeFieldInput: "bg-zinc-800 border-2 border-zinc-600 text-white",
            selectButton: "bg-zinc-800 border-2 border-zinc-600 text-white",
            selectOptionsContainer: "bg-zinc-800 border-2 border-zinc-600",
            selectOption: "text-white hover:bg-zinc-700"
          }
        }}
      />
    </div>
  );
}
