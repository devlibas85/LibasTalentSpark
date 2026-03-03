import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LibasSidebar } from "@/components/Sidebar";

type Role = "hr" | "employee";

interface Props {
  role: Role;
  children: ReactNode;
}

export default function DashboardLayout({ role, children }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-background">
      <LibasSidebar
        role={role}
        onNavigate={navigate}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}