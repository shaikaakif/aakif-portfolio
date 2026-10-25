import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";
import { AdminLayout } from "@/components/admin/AdminLayout";

import "@/styles/admin.css";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthProvider>
  );
}