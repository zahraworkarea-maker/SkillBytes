'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/dashboard/navbar'
import { Toaster } from '@/components/ui/sonner'
import { ReactNode, useEffect, useState } from 'react'

export function LayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show navbar on all pages except login/home page and assessment detail pages (/assesmen/[slug])
  const showNavbar = pathname !== '/' && !pathname.startsWith('/login') && !pathname.startsWith('/assesmen/');

  return (
    <>
      {mounted && showNavbar && <Navbar />}
      {children}
      <Toaster />
    </>
  )
}
