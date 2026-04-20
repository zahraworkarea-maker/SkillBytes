'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/dashboard/navbar'
import { Toaster } from '@/components/ui/sonner'
import { ReactNode, useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export function LayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Navbar is now handled in specific layouts (e.g., siswa layout)
  const showNavbar = false;

  return (
    <>
      {mounted && showNavbar && <Navbar />}
      {children}
      <Toaster />
      <ToastContainer />
    </>
  )
}
