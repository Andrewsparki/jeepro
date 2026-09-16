import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
  title: "Login | JEE Pro",
  description: "Sign in to your JEE Pro workspace.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-7xl mx-auto px-4 min-h-[400px]" />}>
      <LoginForm />
    </Suspense>
  );
}
