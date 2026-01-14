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
            colorInputBackground: "#09090b",
            colorInputText: "#ffffff",
            colorText: "#ffffff",
            colorTextSecondary: "#a1a1aa",
            colorDanger: "#ef4444",
            borderRadius: "0.5rem"
          },
          elements: {
            rootBox: "mx-auto",
            card: "bg-zinc-900 border-2 border-zinc-700 shadow-2xl",
            headerTitle: "text-white text-2xl font-bold",
            headerSubtitle: "text-zinc-400",
            socialButtonsBlockButton: "bg-zinc-800 border-2 border-zinc-700 hover:bg-zinc-700 text-white",
            socialButtonsBlockButtonText: "text-white font-medium",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-semibold",
            formFieldLabel: "text-zinc-300 font-medium",
            formFieldInput: "bg-black border-2 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500",
            footerActionLink: "text-blue-500 hover:text-blue-400 font-medium",
            formFieldInputShowPasswordButton: "text-zinc-400 hover:text-white",
            identityPreviewText: "text-white",
            formHeaderTitle: "text-white",
            formHeaderSubtitle: "text-zinc-400"
          }
        }}
      />
    </div>
  );
}
