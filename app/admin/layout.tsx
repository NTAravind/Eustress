// app/admin/layout.tsx
import { FloatingDock } from "./components/floatingdock"
export const dynamic = "force-dynamic";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
  <>
      {children}
      <FloatingDock />
    </>
  )
}