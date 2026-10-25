"use client";

import { Suspense } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-gate">
          <p>Loading sign in…</p>
        </div>
      }
    >
      <AdminLogin />
    </Suspense>
  );
}