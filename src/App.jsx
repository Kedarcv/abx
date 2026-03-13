import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Home from './pages/Home/Home'
import Shop from './pages/Shop/Shop'
import Checkout from './pages/Checkout/Checkout'
import loadingAnimation from '../YellowArrows.json'
import './App.css'

const MINIMUM_LOADER_TIME = 4000

function InitialLoader() {
  return (
    <div
      aria-label="Loading"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      role="status"
    >
      <div className="w-[220px] max-w-[55vw] sm:w-[280px]">
        <Lottie animationData={loadingAnimation} autoplay loop />
      </div>
    </div>
  )
}

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let timeoutId

    const finishLoading = () => {
      timeoutId = window.setTimeout(() => {
        setIsLoading(false)
      }, MINIMUM_LOADER_TIME)
    }

    if (document.readyState === 'complete') {
      finishLoading()
    } else {
      window.addEventListener('load', finishLoading, { once: true })
    }

    return () => {
      window.removeEventListener('load', finishLoading)

      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/checkout" element={<Checkout />} />
          </Route>
        </Routes>
      </BrowserRouter>
      {isLoading && <InitialLoader />}
    </>
  )
}

export default App
