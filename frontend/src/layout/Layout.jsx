import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

const Layout = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.03),_transparent_40%)]">
        <Navbar />
        <main className="w-full px-4 pb-10 pt-2">
          <Outlet />
        </main>
    </div>
  )
}

export default Layout