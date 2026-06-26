import { AdminNav } from "@/components/AdminNav";

export const dynamic = "force-dynamic";

export default function AdminPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black">
      <AdminNav />
      <main>{children}</main>
    </div>
  );
}
