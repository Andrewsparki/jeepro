import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata = {
  title: "Reset Password | JEE Pro",
  description: "Set a new password for your JEE Pro account.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
