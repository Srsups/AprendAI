
import Navbar from '@/components/layout/Navbar'
import { AppClient } from './_client'
import ScrollToTop from '@/components/shared/ScrollToTop'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <AppClient />
      <main>{children}</main>
      <ScrollToTop />
    </div>
  )
}