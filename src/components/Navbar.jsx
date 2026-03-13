// --- Navbar.jsx ---

import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import heroImage from "../assets/Images/abxlogo.png";

// --- Custom Button Component for the "Merging Pill" Look ---
const MergingPillButton = ({ isActive }) => {
  return (
    <div className="relative cursor-pointer group w-[140px] h-12 flex items-center">
      
      {/* SVG Background */}
      <svg
        viewBox="0 0 140 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full drop-shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(255,122,0,0.3)]"
      >
        <path
          d="M24 1C11.2975 1 1 11.2975 1 24C1 36.7025 11.2975 47 24 47H86C89.5 47 92 44.5 94 42C96.5 39 98 38 102 38C106 38 107.5 39 110 42C112 44.5 114.5 47 118 47C130.703 47 141 36.7025 141 24C141 11.2975 130.703 1 118 1C114.5 1 112 3.5 110 6C107.5 9 106 10 102 10C98 10 96.5 9 94 6C92 3.5 89.5 1 86 1H24Z"
          className={`transition-colors duration-300 fill-transparent 
            ${isActive ? 'fill-white/10' : 'group-hover:fill-white/5'}
          `}
        />
      </svg>

      {/* Text */}
      <span
        className={`absolute left-6 top-1/2 -translate-y-1/2 text-sm font-medium transition-colors duration-300 ${
          isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
        }`}
      >
        Shop
      </span>

      {/* Icon Circle */}
      <div className="absolute right-[-2px] top-1/2 -translate-y-1/2 flex items-center justify-center w-[46px] h-[46px]">
        <div
          className={`absolute inset-0 rounded-full transition-all duration-300
            ${isActive ? 'bg-[#FF7A00] opacity-40 scale-90' : 'bg-white opacity-20 scale-75'}
          `}
        />

        <ShoppingCart
          size={18}
          className={`relative z-10 transition-colors duration-300 ${
            isActive ? 'text-white' : 'text-white/90'
          }`}
        />
      </div>
    </div>
  )
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  
  const isClickScrolling = useRef(false)
  
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'aboutus', label: 'Ethos' },
    { id: 'products', label: 'Ecosystem' },
    { id: 'team', label: 'Team' },
    { id: 'partners', label: 'Partners' },
    
  ]

  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      navigate('/')
      return
    }

    isClickScrolling.current = true

    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setActiveSection('home')
      setIsOpen(false)
    } else {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        setActiveSection(id)
        setIsOpen(false)
      }
    }

    setTimeout(() => {
      isClickScrolling.current = false
    }, 1000)
  }

  useEffect(() => {
    if (location.pathname !== '/') return

    const handleScroll = () => {
      if (isClickScrolling.current) return

      const sectionItems = navItems.filter((item) => item.id !== 'home')
      const viewportMarker = window.innerHeight * 0.35
      let current = 'home'

      for (const item of sectionItems) {
        const element = document.getElementById(item.id)
        if (!element) continue

        const rect = element.getBoundingClientRect()

        if (rect.top <= viewportMarker && rect.bottom > viewportMarker) {
          current = item.id
          break
        }

        if (rect.top <= viewportMarker) {
          current = item.id
        }
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [location.pathname])

  const isShopActive = location.pathname === '/checkout'

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">

      {/* --- Desktop Glass Containers --- */}
      <div className="items-center justify-between hidden gap-4 md:flex">

        {/* Left Glass */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative px-8 py-2 border rounded-full backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border-white/20"
          style={{
            boxShadow: `
              4px 4px 10px rgba(0, 0, 0, 0.5),
              -3px -3px 8px rgba(255, 255, 255, 0.08),
              0 8px 32px 0 rgba(31, 38, 135, 0.37)
            `
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF7A00]/5 to-transparent opacity-50" />
          
          <div className="relative flex items-center h-12 space-x-8">

            <button onClick={() => scrollToSection('home')} className="drop-shadow-[0_0_10px_rgba(255,122,0,0.5)] flex items-center">
              <img src={heroImage} alt="ABX Logo" className="w-auto h-8" />
            </button>

            <div className="flex space-x-2 text-white/90">
              {navItems.map((item) => {
                const isItemActive = !isShopActive && activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="relative px-5 py-2 transition-all duration-300 rounded-full"
                  >
                    {isItemActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 border rounded-full border-white/20"
                        style={{
                          boxShadow: `
                            3px 3px 8px rgba(0, 0, 0, 0.4),
                            -2px -2px 6px rgba(255, 255, 255, 0.07),
                            0 0 20px rgba(255,122,0,0.3),
                            inset 0 0 10px rgba(255,122,0,0.1)
                          `
                        }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    <span className={`relative z-10 transition-colors duration-300 ${
                      isItemActive 
                        ? 'text-white font-semibold' 
                        : 'text-white/90 hover:text-white'
                    }`}>
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>

          </div>
        </motion.div>

        {/* Right Glass */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative px-1 py-1 rounded-[32px] backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent"
          style={{
            boxShadow: `
              4px 4px 10px rgba(0, 0, 0, 0.5),
              -3px -3px 8px rgba(255, 255, 255, 0.08),
              0 8px 32px 0 rgba(31, 38, 135, 0.37)
            `
          }}
        >
          <div
            className={`absolute inset-0 border border-white/20 rounded-full transition-all duration-300 z-0
              ${isShopActive ? 'border-[#FF7A00]/50' : ''}
            `}
            style={{
              boxShadow: isShopActive ? `
                3px 3px 8px rgba(0, 0, 0, 0.4),
                -2px -2px 6px rgba(255, 255, 255, 0.07),
                0 0 20px rgba(255,122,0,0.3),
                inset 0 0 10px rgba(255,122,0,0.1),
                0 0 2px #FF7A00
              ` : `
                inset 0 0 20px rgba(255,122,0,0.05)
              `
            }}
          />

          <Link to="/checkout" className="relative z-10 block">
            <MergingPillButton isActive={isShopActive} />
          </Link>
        </motion.div>

      </div>

      {/* --- Mobile Navbar --- */}
      <div className="flex flex-col md:hidden">
        <div className="flex items-center justify-between w-full px-6 py-3 border rounded-full shadow-lg backdrop-blur-xl bg-white/10 border-white/20">
          <button onClick={() => scrollToSection('home')}>
            <img src={heroImage} alt="Logo" className="w-auto h-7" />
          </button>
          
          <div className="flex items-center gap-4">
            <Link to="/checkout" onClick={() => setIsOpen(false)}>
              <div className={`p-2 rounded-full border border-white/20 ${isShopActive ? 'bg-[#FF7A00]' : 'bg-white/5'}`}>
                <ShoppingCart size={20} className="text-white" />
              </div>
            </Link>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white transition-colors rounded-full bg-white/5 active:bg-white/10"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mt-2 overflow-hidden border shadow-2xl rounded-3xl backdrop-blur-2xl bg-black/40 border-white/20"
            >
              <div className="flex flex-col p-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-6 py-4 rounded-2xl transition-all ${
                      activeSection === item.id 
                      ? 'bg-white/10 text-[#FF7A00] font-bold border border-white/10' 
                      : 'text-white/80'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </nav>
  )
}
