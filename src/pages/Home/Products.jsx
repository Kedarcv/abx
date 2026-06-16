import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import productsBg from '../../assets/Images/productsbackground.png';

import {
  bikerjacketfront, bikerjacketback,
  bikerjacket2front, bikerjacket2back,
  capfront, capback,
  shorts1front, shorts1back,
  pants1front, pants1back,
  xtxverityfront, xtxverityback,
  xtxproverityfront, xtxproverityback,
  abxfiitsneakersfront, abxfiitsneakersback,
  abxfiitrunningtshirtfront, abxfiitrunningtshirtback,
  abxfiitleggingsfront, abxfiitleggingsback,
  abxfiitworkoutcropfront, abxfiitworkoutcropback,
  xtxcodeprosoundsfront, xtxcodeprosoundsback,
  abxtrackvisionprosfront, abxtrackvisionprosback,
  abxcyberhat1front, abxcyberhat1back,
  abxcyberpackerfront, abxcyberpackerback
} from "../../constants/index.js";

const PRODUCTS_DATA = [
  {
    id: 'streetwear',
    label: 'Striit-Fit®',
    items: [
      {
        id: 'p1',
        name: 'ABX V1 Biker Jacket',
        price: '$450.00',
        images: { front: bikerjacketfront, back: bikerjacketback }
      },
       {
        id: 'p9',
        name: 'ABX V2 Biker Jacket',
        price: '$385.00',
        images: { front: bikerjacket2front, back: bikerjacket2back }
      },

      {
        id: 'p16',
        name: 'ABX Cyberhat 1',
        price: '$45.00',
        images: { front: abxcyberhat1front, back: abxcyberhat1back }
      },
      {
        id: 'p2',
        name: 'Urban Stealth Cap',
        price: '$50.00',
        images: { front: capfront, back: capback }
      },

      {
        id: 'p8',
        name: 'ABX Move4ward X-Pants',
        price: '$90.00',
        images: { front: pants1front, back: pants1back }
      },
      {
        id: 'p17',
        name: 'ABX Cyber BackPack',
        price: '$140.00',
        images: { front: abxcyberpackerfront, back: abxcyberpackerback }
      }
      
    ]
  },
  {
    id: 'accessories',
    label: 'ABX Fiit®',
    items: [

      {
        id: 'p10',
        name: 'ABX Fiit Track 1s',
        price: '$120.00',
        images: { front: abxfiitsneakersfront, back: abxfiitsneakersback }
      },
      {
        id: 'p11',
        name: 'ABX Fiit Track Sleeves',
        price: '$40.00',
        images: { front: abxfiitrunningtshirtfront, back: abxfiitrunningtshirtback }
      },
      {
        id: 'p12',
        name: 'ABX Fiit Track Leggings',
        price: '$60.00',
        images: { front: abxfiitleggingsfront, back: abxfiitleggingsback }
      },
      {
        id: 'p13',
        name: 'ABX Fiit Track Crop Top',
        price: '$135.00',
        images: { front: abxfiitworkoutcropfront, back: abxfiitworkoutcropback }
      },
      {
        id: 'p15',
        name: 'ABX Track Vision Pros',
        price: '$55.00',
        images: { front: abxtrackvisionprosfront, back: abxtrackvisionprosback }
      },

      {
        id: 'p3',
        name: 'ABX Forward MotionShorts',
        price: '$80.00',
        images: { front: shorts1front, back: shorts1back }
      },

    ]
  },
  {
    id: 'devices',
    label: 'XTXCODE®',
    items: [
      {
        id: 'p5',
        name: 'XTX Code',
        price: '$90.00',
        images: { front: xtxverityfront, back: xtxverityback }
      },
      {
        id: 'p6',
        name: 'XTX Pro Code',
        price: '$160.00',
        images: { front: xtxproverityfront, back: xtxproverityback }
      },
      {
        id: 'p14',
        name: 'XTX Code Pro Sounds',
        price: '$245.00',
        images: { front: xtxcodeprosoundsfront, back: xtxcodeprosoundsback }
      }
    ]
  }
];

const ProductsSection = () => {
  const [activeCategory, setActiveCategory] = useState('streetwear');
  const [productIndex, setProductIndex] = useState(0);
  const [viewSide, setViewSide] = useState('front');

  const currentCategoryData = PRODUCTS_DATA.find(cat => cat.id === activeCategory);
  const currentProduct = currentCategoryData.items[productIndex];

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setProductIndex(0);
    setViewSide('front');
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
      <div className="relative z-10 w-[95%] max-w-7xl mx-auto h-full">
        <div className="mb-8 text-center md:hidden">
            <h2 className="text-3xl font-bold text-white font-orbitron">PRODUCTS</h2>
        </div>

        <div className="grid items-center h-full grid-cols-1 gap-8 md:grid-cols-12">
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
                      ? 'bg-black/40 border-[#F4EC47] shadow-[0_0_20px_rgba(255,122,0,0.3)]'
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
                </button>
              );
            })}
          </div>

          <div className="md:col-span-6 flex flex-col items-center justify-center relative order-2 min-h-[500px]">
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

            <div className="flex gap-2 mt-6">
               {currentCategoryData.items.map((_, idx) => (
                 <div 
                   key={idx}
                   className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === productIndex ? 'bg-[#FF7A00] w-6' : 'bg-white/20'}`}
                 />
               ))}
            </div>

          </div>

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
              
              <div className="w-20 h-1 bg-[#F4EC47] mt-4 mb-6 mx-auto md:mx-0" />

              <p className="mb-8 font-mono text-4xl font-light text-white/90">
                {currentProduct.price}
              </p>

              <Link to="/shop" className="group relative inline-flex px-8 py-3 bg-white/5 border border-white/10 backdrop-blur-md rounded-full overflow-hidden transition-all duration-300 hover:border-[#FF7A00]/50 hover:shadow-[0_0_30px_rgba(255,122,0,0.2)]">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold tracking-wide group-hover:text-[#FF7A00] transition-colors">
                    VISIT SHOP
                  </span>
                  <ShoppingBag size={18} className="text-white/70 group-hover:text-[#FF7A00] transition-colors" />
                </div>
              </Link>

            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
