'use client'

import { Navbar } from '@/components/dashboard/navbar'

export default function SiswaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}