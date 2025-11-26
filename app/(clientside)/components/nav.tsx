"use client"
import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// =================================================================
// Navbar Component
// =================================================================

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Constants
  const BORDER_COLOR = 'border-neutral-800';
  const BG_BLACK = 'bg-black';
  const LOGO_PATH = "/images/2-removebg-preview.png"; 

  // --- Scroll Effect ---
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Workshops', href: '/workshops' },
    { name: 'Programs', href: '/#programs' }, 
    { name: 'Coach', href: '/#about' },      
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "circOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${BG_BLACK} border-b ${BORDER_COLOR} ${scrolled ? 'shadow-xl shadow-red-600/10' : ''}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          
          {/* 1. LOGO: ANIMATED GROUP */}
          <motion.a 
            href="/" 
            className="flex items-center gap-3 pr-8 group"
            whileHover="hover"
          >
            <motion.img
              src={LOGO_PATH}
              alt="Eustress Performance Logo"
              width={80} 
              height={80} 
              className="w-16 h-16 object-contain"
              variants={{
                hover: { scale: 1.1, rotate: -5 }
              }}
              transition={{ type: "spring", stiffness: 300 }}
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/56x56/171717/FFFFFF?text=Logo'; }}
            />
            <span className="text-3xl font-black text-white tracking-tighter uppercase select-none relative">
              Eustress  
              {/* Animated Red Square */}
              <motion.span 
                variants={{
                  hover: { rotate: 180, backgroundColor: "#ffffff" }
                }}
                className="inline-flex w-[10px] h-[10px] bg-red-600 ml-1 transform translate-y-[-2px]"
              />
            </span>
          </motion.a>

          {/* 2. DESKTOP NAV: DASHBOARD TABS WITH HOVER LINE */}
          <div className="hidden md:flex items-center h-20">
            <div className={`flex h-full border-l ${BORDER_COLOR}`}>
              {navItems.map((item, index) => (
                <a
                  key={item.name}
                  href={item.href}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`
                    relative flex items-center px-8 h-full 
                    text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 
                    border-r ${BORDER_COLOR} 
                    transition-colors duration-300
                    hover:text-white
                  `}
                >
                  <span className="relative z-10">{item.name}</span>
                  
                  {/* Background Hover Fill Animation */}
                  <AnimatePresence>
                    {hoveredIndex === index && (
                      <motion.div
                        className="absolute inset-0 bg-neutral-900"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Bottom Red Line Animation */}
                  <AnimatePresence>
                    {hoveredIndex === index && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-600"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        transition={{ duration: 0.25 }}
                      />
                    )}
                  </AnimatePresence>
                </a>
              ))}
            </div>

            {/* CTA Button with Tap Effect */}
            <div className="pl-8">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  className="rounded-none bg-white text-black hover:bg-red-600 hover:text-white border border-transparent transition-colors font-bold uppercase tracking-wider text-xs px-6 py-6"
                >
                  Get Started
                </Button>
              </motion.div>
            </div>
          </div>

          {/* 3. MOBILE MENU TRIGGER */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-red-600 hover:text-white rounded-none w-12 h-12"
            >
               {/* Icon Rotation Animation */}
               <motion.div
                 initial={false}
                 animate={{ rotate: isOpen ? 90 : 0 }}
                 transition={{ duration: 0.2 }}
               >
                 {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
               </motion.div>
            </Button>
          </div>
        </div>
      </div>

      {/* 4. MOBILE NAVIGATION OVERLAY - SLIDE & STAGGER */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100vh - 80px)" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 top-20 z-40 bg-black border-t border-neutral-800 md:hidden overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className="flex items-center justify-between px-6 py-8 border-b border-neutral-900 text-3xl font-black uppercase tracking-tighter text-white group"
                  onClick={() => setIsOpen(false)}
                >
                  <motion.span 
                    className="group-hover:pl-4 transition-all duration-300"
                  >
                    {item.name}
                  </motion.span>
                  <ArrowRight className="w-6 h-6 text-neutral-700 group-hover:text-red-600 transition-colors" />
                </motion.a>
              ))}
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="p-6 mt-auto mb-20"
              >
                <Button className="w-full rounded-none bg-red-600 text-white hover:bg-white hover:text-black uppercase font-bold py-6 tracking-wider transition-colors text-lg">
                  Start Training
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}