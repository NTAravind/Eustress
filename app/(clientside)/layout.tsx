// app/admin/layout.tsx

import Navbar from "./components/nav"
import { WhatsAppFloat } from "./components/whatsapp"


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
  <> <Navbar/>
    <WhatsAppFloat/>
      {children}
   
    </>
  )
}