'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/dashboard/navbar'
import { ReactNode, useEffect, useState } from 'react'

export function LayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showNavbar = pathname !== '/';

  return (
    <>
      {mounted && showNavbar && <Navbar />}
      {children}
    </>
  )
}
