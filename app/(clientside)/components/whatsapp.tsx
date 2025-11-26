"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// CONFIG
// ============================================
const WHATSAPP_NUMBER = "918660485788";
const PREFILLED_MESSAGE = "Hi, I'm interested in joining a workshop.";
const EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ============================================
// COMPONENT
// ============================================
export function WhatsAppFloat() {
  const [isHovered, setIsHovered] = useState(false);

  // WhatsApp Link Construction
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    PREFILLED_MESSAGE
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASING, delay: 1 }}
      className="fixed bottom-6 right-6 md:bottom-12 md:right-12 z-50 flex flex-col items-end gap-2"
    >
      {/* Label Tooltip (Appears on Hover) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3, ease: EASING }}
            className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap hidden md:block"
          >
            <div className="bg-neutral-900 border border-neutral-800 px-3 py-2 text-[10px] uppercase font-bold tracking-[0.2em] text-white">
              Start <span className="text-red-600">Now</span>
            </div>
            {/* Connector Line */}
            <div className="absolute right-[-16px] top-1/2 w-4 h-px bg-red-600/50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Decorative Glow effect */}
        <div className="absolute -inset-1 bg-red-600/50 opacity-20 group-hover:opacity-40 blur-md transition-opacity duration-500" />

        <div
          className={`
            relative flex items-center justify-center 
            w-14 h-14 md:w-16 md:h-16 
            bg-red-600 
            border border-red-500 
            group-hover:bg-red-700
            group-hover:border-red-400
            transition-colors duration-300
          `}
        >
          {/* Internal Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff33_1px,transparent_1px),linear-gradient(to_bottom,#ffffff33_1px,transparent_1px)] bg-[size:0.5rem_0.5rem] pointer-events-none" />

          {/* Corner Accents (Industrial Feel) */}
          <div className="absolute top-0 left-0 w-1 h-1 bg-red-500 group-hover:bg-red-400 transition-colors duration-300" />
          <div className="absolute bottom-0 right-0 w-1 h-1 bg-red-500 group-hover:bg-red-400 transition-colors duration-300" />

          {/* Icon Container */}
          <div className="relative z-10 p-3">
            <WhatsAppIcon className="w-6 h-6 md:w-8 md:h-8 text-white transition-colors duration-300" />
          </div>

          {/* Status Dot (Online Indicator) - White for contrast */}
          <span className="absolute top-3 right-3 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        </div>

        {/* Text Slide-out (Mobile Optimized: Hidden on very small screens to save space, or kept minimal) */}
        <div className="absolute top-full right-0 mt-2 w-full text-center overflow-hidden h-0 group-hover:h-auto transition-all duration-300">
          <p className="text-[9px] uppercase tracking-widest text-red-600 font-bold bg-black/80 backdrop-blur-sm py-1">
            Chat
          </p>
        </div>
      </a>
    </motion.div>
  );
}

// ============================================
// SVG ICON (Custom styled for minimal look)
// ============================================
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5" // Thinner stroke matches the "Light" text in your hero
      strokeLinecap="square" // Square linecaps for industrial feel
      strokeLinejoin="miter"
      className={className}
    >
      <path d="M3 21l1.65-3.8C3.3 15.6 2.6 13.5 2.6 11.3 2.6 5.8 7.2 1.3 12.7 1.3c2.7 0 5.3 1.1 7.2 3 1.9 1.9 3 4.5 3 7.2 0 5.5-4.5 10-10.1 10-1.8 0-3.5-.5-5-1.4L3 21z" />
      <path d="M16.6 14.3c-.2-.1-1.3-.7-1.5-.7-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.1-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.3 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.3.3-.4.1-.2.1-.3 0-.4-.1-.1-.4-1.1-.6-1.4-.2-.4-.4-.3-.6-.3h-.5c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7 0 1.6 1.2 3.1 1.3 3.3.2.2 2.3 3.6 5.6 5 2.2.9 3 .8 4 .7.9 0 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.1-.3-.2-.5-.3z" />
    </svg>
  );
}