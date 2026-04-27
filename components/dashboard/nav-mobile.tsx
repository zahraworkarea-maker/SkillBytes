'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Menu, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/use-auth'
import { NavLogo } from './nav-logo'

export function NavMobile() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const displayName = user?.name || 'User'
  const displayRole = (user?.role_label || user?.role || '-').toUpperCase()
  const avatarInitial = displayName.charAt(0).toUpperCase()

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
    router.replace('/')
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/materi', label: 'Materi' },
    { href: '/pbl', label: 'PBL' },
    { href: '/assesmen', label: 'Assesmen' },
  ]

  return (
    <>
      {/* Mobile Navbar */}
      <nav className="bg-white border-b shadow-sm px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between sticky top-0 z-50">
        <NavLogo />

        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </nav>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          {/* Sidebar Header */}
          <SheetHeader className="px-4 py-4 border-b">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                  pathname === link.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Separator */}
          <Separator />

          {/* User Info & Logout at Bottom */}
          <div className="px-4 py-4 space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3 pb-3 border-b">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gray-200 text-gray-600 font-semibold">{avatarInitial}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{displayName}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{displayRole}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
