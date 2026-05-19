'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/dashboard/navbar'

interface SiswaLayoutProps {
  children: ReactNode
}

export default function SiswaLayout({ children }: SiswaLayoutProps) {
  const pathname = usePathname()

  const hideNavbar =
    pathname.includes('/assesmen/') &&
    pathname.includes('/quiz')

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  )
}