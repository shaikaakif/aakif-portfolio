import type { Metadata } from "next";

import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminToastProvider } from "@/components/admin/ui/AdminUi";

import "@/styles/admin.css";

export const metadata: Metadata = {
  title: {
    default: "Aakif Studio",
    template: "%s | Aakif Studio",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  icons: {
    icon: [{ url: "/admin-favicon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/admin-favicon.svg", type: "image/svg+xml" }],
  },
};

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminToastProvider>
        <AdminLayout>{children}</AdminLayout>
      </AdminToastProvider>
    </AdminAuthProvider>
  );
}
