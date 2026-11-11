import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.ts'

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
  const { user, loading, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex w-full max-w-[1100px] flex-wrap items-center gap-4 px-4 py-4">
        {links.map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end} className={getNavLinkClass}>
            {label}
          </NavLink>
        ))}

        {!loading &&
          (user ? (
            <>
              <NavLink to="/profile" className={getNavLinkClass}>
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
              <NavLink to="/login" className={getNavLinkClass}>
                Login
              </NavLink>
              <NavLink to="/signup" className={getNavLinkClass}>
                Signup
              </NavLink>
            </>
          ))}
      </nav>
    </header>
  )
}
