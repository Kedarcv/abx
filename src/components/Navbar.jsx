import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import heroImage from "../assets/Images/abxlogo.png";
import abxlogo3 from "../assets/Images/abxlogo3.png";
import { useCart } from '../store/cart.js';
import { useAuth } from '../store/auth.js';

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'aboutus', label: 'Ethos' },
  { id: 'products', label: 'Ecosystem' },
  { id: 'team', label: 'Team' },
  { id: 'partners', label: 'Partners' },
]

const MergingPillButton = ({ isActive, count = 0 }) => {
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

      <span
        className={`absolute left-6 top-1/2 -translate-y-1/2 text-sm font-medium transition-colors duration-300 ${
          isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
        }`}
      >
        Shop
      </span>

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
        {count > 0 && (
          <span className="absolute -top-1 -right-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-[#FF7A00] px-1 text-[10px] font-bold text-black shadow-md">
            {count > 99 ? '99+' : count}
          </span>
        )}
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
  const cartCount = useCart(s => s.items.reduce((n, i) => n + i.quantity, 0))
  const openCart  = useCart(s => s.open)
  const user      = useAuth(s => s.user)
  const role      = useAuth(s => s.role)
  const isStaff   = (['fulfillment','editor','admin','superAdmin']).includes(role)

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

      const sectionItems = NAV_ITEMS.filter((item) => item.id !== 'home')
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

    const isShopActive = location.pathname.startsWith('/shop') || location.pathname.startsWith('/checkout')

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-7xl">

      {/* --- Desktop Glass Containers --- */}
      <div className="items-center justify-between hidden gap-4 md:flex">

        {/* Left Glass */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative py-2 pr-8 border rounded-full pl-14 backdrop-blur-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border-white/20"
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
                                          {NAV_ITEMS.map((item) => {
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

          <Link to="/shop" className="relative z-10 block">
            <MergingPillButton isActive={isShopActive} count={cartCount} />
          </Link>
        </motion.div>

        {/* Account pill (desktop) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="hidden lg:flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl px-1.5 py-1.5"
        >
          {user ? (
            <>
              {isStaff && (
                <Link to="/admin" className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#FF7A00] hover:text-white">
                  Admin
                </Link>
              )}
              <Link
                to="/account/orders"
                title={user.email ?? 'Account'}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white hover:bg-white/20"
              >
                {(user.email ?? '?').slice(0,1).toUpperCase()}
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/85 hover:text-white"
            >
              <User size={14} /> Sign in
            </Link>
          )}
        </motion.div>

      </div>

      {/* --- Mobile Navbar --- */}
      <div className="flex flex-col w-full md:hidden">

        <div className="flex items-center justify-between w-full gap-2 pr-2">

          {/* Pill 1: MOVE 4WAAD & Logo (Left Pill) */}
          <div className="flex items-center justify-between flex-1 h-12 pl-6 pr-1 border rounded-full shadow-lg backdrop-blur-xl bg-white/10 border-white/20">
            <h1
              className="text-sm font-bold text-white md:text-base drop-shadow-md whitespace-nowrap"
              style={{ fontFamily: '"Cyberform Demo", sans-serif' }}
            >
              MOVE <span className="text-[#FF7A00]">4WAAD</span>
              <sup className="ml-1 text-[12px] align-super opacity-80">™</sup>
            </h1>

            {/* abxlogo3 on the right edge of the left pill */}
            <button
              onClick={() => scrollToSection('home')}
              className="flex items-center justify-center w-10 h-10 transition-colors rounded-full shrink-0 "
            >
              <img src={abxlogo3} alt="Logo" className="object-contain w-auto h-5 drop-shadow-md" />
            </button>
          </div>

          {/* Pill 2: Icons (Far Right) */}
          <div className="flex items-center justify-center h-12 gap-2 px-3 border rounded-full shadow-lg shrink-0 backdrop-blur-xl bg-white/10 border-white/20">
            <button
              onClick={() => { setIsOpen(false); openCart(); }}
              aria-label="Open cart"
              className="relative"
            >
              <div className={`p-1.5 rounded-full transition-colors ${isShopActive ? 'text-[#FF7A00]' : 'text-white hover:text-white/80'}`}>
                <ShoppingCart size={18} />
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-[#FF7A00] px-1 text-[10px] font-bold text-black">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            <div className="w-[1px] h-5 bg-white/20" />

            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 text-white transition-colors hover:text-white/80"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
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
              className="mt-3 overflow-hidden border shadow-2xl rounded-3xl backdrop-blur-2xl bg-black/40 border-white/20"
            >
              <div className="flex flex-col p-4 space-y-2">
                                {NAV_ITEMS.map((item) => (
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

                <div className="h-px bg-white/10 my-2" />

                <Link
                  to="/shop"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-left px-6 py-4 rounded-2xl text-white/85 hover:text-white flex items-center justify-between"
                >
                  <span className="font-medium">Shop</span>
                  {cartCount > 0 && (
                    <span className="rounded-full bg-[#FF7A00] px-2 py-0.5 text-[10px] font-bold text-black">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>

                {user ? (
                  <>
                    {isStaff && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="w-full text-left px-6 py-4 rounded-2xl text-[#FF7A00] font-semibold"
                      >
                        Admin dashboard
                      </Link>
                    )}
                    <Link
                      to="/account/orders"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-left px-6 py-4 rounded-2xl text-white/85 hover:text-white truncate"
                    >
                      My orders
                      <span className="block text-[11px] text-white/45 mt-1 truncate">{user.email}</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left px-6 py-4 rounded-2xl bg-[#FF7A00] text-black font-semibold"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </nav>
  )
}
