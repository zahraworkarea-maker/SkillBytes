'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { useIsMobile } from '@/hooks/use-mobile'
import { NavLogo } from './nav-logo'
import { NavMobile } from './nav-mobile'

export function Navbar() {
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const displayName = user?.name || 'User'
  const displayRole = (user?.role_label || user?.role || '-').toUpperCase()
  const avatarInitial = displayName.charAt(0).toUpperCase()

  const handleLogout = async () => {
    await logout()
    router.replace('/')
  }

  if (isMobile) {
    return <NavMobile />
  }

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm px-8 py-3.5 flex items-center justify-between">
        <NavLogo />

        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className={`text-base font-semibold transition-colors ${
              pathname === '/dashboard'
                ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
                : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/materi"
            className={`text-base font-medium transition-colors ${
              pathname === '/materi'
                ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
                : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            Materi
          </Link>
          <Link
            href="/pbl"
            className={`text-base font-medium transition-colors ${
              pathname === '/pbl'
                ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
                : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            PBL
          </Link>
          <Link
            href="/assesmen"
            className={`text-base font-medium transition-colors ${
              pathname === '/assesmen'
                ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
                : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            Assesmen
          </Link>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-gray-200 text-gray-600 text-base font-semibold">{avatarInitial}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-semibold text-gray-800 leading-tight">{displayName}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{displayRole}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleLogout}
              variant="destructive"
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </>
  )
}
