import { Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar.tsx'

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-8">
          <Outlet />
        </div>
      </main>
      <footer className="border-t">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-4 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Product Catalog
        </div>
      </footer>
    </div>
  )
}
