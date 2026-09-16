import { verifyAdmin } from "@/features/admin/services/admin-auth.service";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { AdminTopbar } from "@/features/admin/components/admin-topbar";

export const metadata = {
  title: "Admin Panel | JEE Pro",
  description: "JEE Pro administrative control center",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side admin verification — calls forbidden() if not admin
  const { profile } = await verifyAdmin();

  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0a]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar
          adminName={profile.full_name}
          adminEmail={profile.email}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
