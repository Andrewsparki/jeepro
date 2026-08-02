import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata = {
  title: "Forgot Password | JEE Pro",
  description: "Reset your JEE Pro password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
