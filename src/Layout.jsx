// Layout.jsx

import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Navbar />
      <main className="flex-1 w-full overflow-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout