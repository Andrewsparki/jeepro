import { Suspense } from "react";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata = {
  title: "Sign Up | JEE Pro",
  description: "Create your JEE Pro account.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-7xl mx-auto px-4 min-h-[400px]" />}>
      <SignupForm />
    </Suspense>
  );
}
