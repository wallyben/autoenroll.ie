'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-8 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold">AutoEnroll.ie</span>
          </Link>
        </div>
        
        {user ? (
          <>
            <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
              <Link
                href="/dashboard"
                className={`transition-colors hover:text-foreground/80 ${
                  isActive('/dashboard') ? 'text-foreground' : 'text-foreground/60'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/upload"
                className={`transition-colors hover:text-foreground/80 ${
                  isActive('/upload') ? 'text-foreground' : 'text-foreground/60'
                }`}
              >
                Upload
              </Link>
              <Link
                href="/results"
                className={`transition-colors hover:text-foreground/80 ${
                  isActive('/results') ? 'text-foreground' : 'text-foreground/60'
                }`}
              >
                Results
              </Link>
              <Link
                href="/billing"
                className={`transition-colors hover:text-foreground/80 ${
                  isActive('/billing') ? 'text-foreground' : 'text-foreground/60'
                }`}
              >
                Billing
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  Settings
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </>
        ) : (
          <>
            <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
              <Link
                href="/pricing"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Pricing
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
