// --- Products.jsx ---

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RefreshCw, ShoppingBag } from 'lucide-react';
import productsBg from '../../assets/Images/productsbackground.png';

// Import images from constants as requested
import { 
  bikerjacketfront, bikerjackerback, 
  capfront, capback, 
  backpackfront, backpackback, 
  glassesfront, glassesback, 
  smartwatchfront, smartwatchback, 
  earpodsfront, earpodsback, 
  shorts1front, shorts1back,
  pants1front, pants1back
} from "../../constants/index.js";

// --- Data Structure ---
const PRODUCTS_DATA = [
  {
    id: 'streetwear',
    label: 'Striit-Fit®',
    items: [
      {
        id: 'p1',
        name: 'ABX V1 Biker Jacket',
        price: '$450.00',
        images: { front: bikerjacketfront, back: bikerjackerback }
      },
      {
        id: 'p2',
        name: 'Urban Stealth Cap',
        price: '$65.00',
        images: { front: capfront, back: capback }
      },

      {
        id: 'p7',
        name: 'ABX Forward MotionShorts',
        price: '$80.00',
        images: { front: shorts1front, back: shorts1back }
      },

      {
        id: 'p8',
        name: 'ABX Move4ward X-Pants',
        price: '$425.00',
        images: { front: pants1front, back: pants1back }
      }
      
    ]
  },
  {
    id: 'accessories',
    label: 'ABX Fiit®',
    items: [
      {
        id: 'p3',
        name: 'Tactical Backpack',
        price: '$120.00',
        images: { front: backpackfront, back: backpackback }
      },
      {
        id: 'p4',
        name: 'Neo-Vision Glasses',
        price: '$180.00',
        images: { front: glassesfront, back: glassesback }
      }
    ]
  },
  {
    id: 'XTX',
    label: 'Devices',
    items: [
      {
        id: 'p5',
        name: 'Chrono-Link Watch',
        price: '$299.00',
        images: { front: smartwatchfront, back: smartwatchback }
      },
      {
        id: 'p6',
        name: 'Sonic Nodes Pro',
        price: '$150.00',
        images: { front: earpodsfront, back: earpodsback }
      }
    ]
  }
];

const ProductsSection = () => {
  const [activeCategory, setActiveCategory] = useState('streetwear');
  const [productIndex, setProductIndex] = useState(0);
  const [viewSide, setViewSide] = useState('front'); // 'front' or 'back'

  // Derive current data
  const currentCategoryData = PRODUCTS_DATA.find(cat => cat.id === activeCategory);
  const currentProduct = currentCategoryData.items[productIndex];

  // Handlers
  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setProductIndex(0); // Reset to first product
    setViewSide('front'); // Reset view
  };

  const handleNext = () => {
    setProductIndex((prev) => (prev + 1) % currentCategoryData.items.length);
    setViewSide('front');
  };

  const handlePrev = () => {
    setProductIndex((prev) => (prev - 1 + currentCategoryData.items.length) % currentCategoryData.items.length);
    setViewSide('front');
  };

  const toggleView = (side) => {
    setViewSide(side);
  };

  return (
    <section 
      id="products"
      className="relative flex items-center justify-center w-full min-h-screen py-20 overflow-hidden bg-center bg-no-repeat bg-cover"
      style={{ 
        backgroundImage: `url(${productsBg})` 
      }}
    >
      {/* Dark Overlay for readability */}
      {/* <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" /> */}

      <div className="relative z-10 w-[95%] max-w-7xl mx-auto h-full">
        
        {/* Mobile Title (Only visible on small screens) */}
        <div className="mb-8 text-center md:hidden">
            <h2 className="text-3xl font-bold text-white font-orbitron">PRODUCTS</h2>
        </div>

        {/* Main Grid Layout */}
        <div className="grid items-center h-full grid-cols-1 gap-8 md:grid-cols-12">

          {/* --- COLUMN 1: Category Selection (Far Left) --- */}
          <div className="flex flex-row justify-center order-1 gap-4 md:col-span-3 md:flex-col md:gap-8">
            {PRODUCTS_DATA.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`
                    relative group px-6 py-4 rounded-xl border transition-all duration-300 w-full md:w-4/5 mx-auto
                    ${isActive 
                      ? 'bg-black/40 border-[#FF7A00] shadow-[0_0_20px_rgba(255,122,0,0.3)]' 
                      : 'bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5'
                    }
                  `}
                >
                  <span className={`
                    text-lg md:text-xl font-medium tracking-wider font-orbitron
                    ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}
                  `}>
                    {cat.label}
                  </span>
                  
                  {/* Active Indicator Dot */}
                  {/* {isActive && (
                    <motion.div 
                      layoutId="activeDot"
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#FF7A00]"
                    />
                  )} */}
                </button>
              );
            })}
          </div>

          {/* --- COLUMN 2: Product Preview (Middle) --- */}
          <div className="md:col-span-6 flex flex-col items-center justify-center relative order-2 min-h-[500px]">
            
            {/* Arrows */}
            <button 
              onClick={handlePrev}
              className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/10 bg-black/40 text-white/70 hover:text-[#FF7A00] hover:border-[#FF7A00] hover:bg-black/80 transition-all duration-300"
            >
              <ChevronLeft size={32} />
            </button>
            
            <button 
              onClick={handleNext}
              className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/10 bg-black/40 text-white/70 hover:text-[#FF7A00] hover:border-[#FF7A00] hover:bg-black/80 transition-all duration-300"
            >
              <ChevronRight size={32} />
            </button>

            {/* Product Image Stage */}
            <div className="relative w-full h-[400px] flex items-center justify-center">
               <AnimatePresence mode="wait">
                  <motion.img
                    key={`${currentProduct.id}-${viewSide}`}
                    src={currentProduct.images[viewSide]}
                    alt={currentProduct.name}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="max-h-full max-w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  />
               </AnimatePresence>
            </div>

            {/* View Controls (Front/Back) */}
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={() => toggleView('front')}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border
                  ${viewSide === 'front' 
                    ? 'bg-[#FF7A00] text-black border-[#FF7A00]' 
                    : 'bg-transparent text-white/60 border-white/20 hover:text-white hover:border-white'
                  }
                `}
              >
                Front View
              </button>
              
              <div className="w-[1px] h-6 bg-white/20"></div>

              <button
                onClick={() => toggleView('back')}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border
                  ${viewSide === 'back' 
                    ? 'bg-[#FF7A00] text-black border-[#FF7A00]' 
                    : 'bg-transparent text-white/60 border-white/20 hover:text-white hover:border-white'
                  }
                `}
              >
                Back View
              </button>
            </div>
            
            {/* Pagination Dots */}
            <div className="flex gap-2 mt-6">
               {currentCategoryData.items.map((_, idx) => (
                 <div 
                   key={idx}
                   className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === productIndex ? 'bg-[#FF7A00] w-6' : 'bg-white/20'}`}
                 />
               ))}
            </div>

          </div>

          {/* --- COLUMN 3: Info & Actions (Far Right) --- */}
          <div className="flex flex-col items-center justify-center order-3 space-y-6 text-center md:col-span-3 md:items-start md:text-left">
            
            <motion.div
               key={currentProduct.id}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.5 }}
            >
              <h2 
                className="mb-2 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {currentProduct.name}
              </h2>
              
              <div className="w-20 h-1 bg-[#FF7A00] mt-4 mb-6 mx-auto md:mx-0" />

              <p className="mb-8 font-mono text-4xl font-light text-white/90">
                {currentProduct.price}
              </p>

              {/* Visit Shop Button (Styled based on Home Hero) */}
              <button className="group relative px-8 py-3 bg-white/5 border border-white/10 backdrop-blur-md rounded-full overflow-hidden transition-all duration-300 hover:border-[#FF7A00]/50 hover:shadow-[0_0_30px_rgba(255,122,0,0.2)]">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold tracking-wide group-hover:text-[#FF7A00] transition-colors">
                    VISIT SHOP
                  </span>
                  <ShoppingBag size={18} className="text-white/70 group-hover:text-[#FF7A00] transition-colors" />
                </div>
              </button>

            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default ProductsSection;