import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { selectIsAuthenticated } from '../features/auth/authSlice.ts'
import { useAuth } from '../hooks/useAuth.ts'
import { useAppSelector } from '../store/hooks.ts'
import ConnectivityStatus from './ConnectivityStatus.tsx'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/products', label: 'Products' },
  { to: '/dashboard', label: 'Dashboard' },
]

function getNavLinkClass({ isActive }: { isActive: boolean }) {
  return `text-sm font-medium transition-colors ${
    isActive
      ? 'text-foreground'
      : 'text-muted-foreground hover:text-foreground'
  }`
}

export default function NavBar() {
  const { loading, logout } = useAuth()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const [loggingOut, setLoggingOut] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname, location.search, location.hash])

  useEffect(() => {
    if (!isMenuOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    function handlePointerDown(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isMenuOpen])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  const navigationLinks = (
    <>
      {links.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={getNavLinkClass}
          onClick={() => setIsMenuOpen(false)}
        >
          {label}
        </NavLink>
      ))}

      {!loading &&
        (isAuthenticated ? (
          <>
            <NavLink
              to="/profile"
              className={getNavLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              {loggingOut ? 'Logging out…' : 'Logout'}
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={getNavLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </NavLink>
            <NavLink
              to="/signup"
              className={getNavLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              Signup
            </NavLink>
          </>
        ))}
    </>
  )

  return (
    <header className="border-b bg-background">
      <nav
        ref={navRef}
        className="app-container relative flex min-h-16 items-center gap-3 py-2"
        aria-label="Main navigation"
      >
        <div className="hidden items-center gap-4 md:flex">
          {navigationLinks}
        </div>

        <div className="ml-auto">
          <ConnectivityStatus />
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          {isMenuOpen ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <Menu aria-hidden="true" className="size-5" />
          )}
        </button>

        {isMenuOpen && (
          <div
            id="mobile-navigation"
            className="absolute inset-x-0 top-full z-40 mt-1 flex max-h-[calc(100dvh-4.5rem)] flex-col gap-1 overflow-y-auto rounded-lg border bg-background p-3 shadow-lg md:hidden"
          >
            {navigationLinks}
          </div>
        )}
      </nav>
    </header>
  )
}
