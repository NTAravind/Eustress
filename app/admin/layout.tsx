// app/admin/layout.tsx
import { FloatingDock } from "./components/floatingdock"

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