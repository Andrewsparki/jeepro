import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = constructMetadata({
  title: "Settings",
  noIndex: true,
});

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and preferences."
      />
      <div className="rounded-xl border border-border bg-card p-8">
        <p className="text-sm text-muted">Account settings will be implemented here.</p>
      </div>
    </>
  );
}
