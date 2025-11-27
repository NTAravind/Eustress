"use client";
import React from "react";
import { Workshop } from "@/app/generated/prisma";
import { Calendar, Clock, MapPin, Users, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

interface WorkshopCardProps {
  workshop: Workshop;
}

export function WorkshopCard({ workshop }: WorkshopCardProps) {
  const finalPrice = workshop.price - (workshop.price * workshop.discount) / 100;
  const hasDiscount = workshop.discount > 0;
  const occupancyPercentage =
    ((workshop.totalSeats - workshop.availableSeats) / workshop.totalSeats) * 100;
  const isAlmostFull = occupancyPercentage >= 80;
  const isSoldOut = workshop.availableSeats === 0;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const BORDER_COLOR = "border-neutral-800";
  
  // Animation Variants
  const cardVariants: Variants = {
    rest: { y: 0, borderColor: "#262626" },
    hover: { 
      y: -8, 
      borderColor: "#DC2626",
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  const buttonVariants: Variants = {
    rest: { x: 0 },
    hover: { x: 5 }
  };

  return (
    <Link
      href={isSoldOut ? "#" : `/workshops/${workshop.id}`}
      className={`block h-full focus:outline-none ${isSoldOut ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      <motion.div
        initial="rest"
        whileHover={isSoldOut ? "rest" : "hover"}
        animate="rest"
        variants={cardVariants}
        className="flex flex-col bg-black border h-full relative group overflow-hidden"
      >
        {/* 1. Image Section with Overlay */}
        <div className={`relative h-64 w-full border-b ${BORDER_COLOR} overflow-hidden bg-neutral-900`}>
          <Image
            src={workshop.thumbnail}
            alt={workshop.title}
            fill
            className={`object-cover transition-all duration-700 ease-out ${isSoldOut ? 'grayscale opacity-50' : 'grayscale group-hover:grayscale-0 group-hover:scale-110'}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Brutalist Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

          {/* Status Badges - Sharp & Technical */}
          <div className="absolute top-4 left-4 flex flex-col items-start gap-2 z-10">
            {hasDiscount && (
              <div className="bg-white text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                Save {workshop.discount}%
              </div>
            )}
            {isAlmostFull && !isSoldOut && (
              <div className="bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest animate-pulse">
                Few Seats Left
              </div>
            )}
            {isSoldOut && (
              <div className="bg-neutral-800 text-neutral-400 px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-neutral-600">
                Sold Out
              </div>
            )}
          </div>
        </div>

        {/* 2. Content Body */}
        <div className="flex-1 p-6 md:p-8 flex flex-col relative">
          {/* Decorative numbering or lines */}
          <div className="absolute top-0 right-0 p-4 opacity-20">
             <ArrowRight className="w-12 h-12 -rotate-45 text-white" />
          </div>

          <h3 className={`text-2xl md:text-3xl font-black uppercase leading-[0.85] mb-4 tracking-tight transition-colors ${isSoldOut ? 'text-neutral-600' : 'text-white group-hover:text-red-600'}`}>
            {workshop.title}
          </h3>

          <p className="text-xs md:text-sm text-neutral-500 line-clamp-3 mb-8 leading-relaxed font-mono uppercase tracking-wide">
            {workshop.description}
          </p>

          {/* Technical Data Grid */}
          <div className="mt-auto grid grid-cols-2 gap-px bg-neutral-900 border border-neutral-800">
            <div className="bg-black p-3 flex flex-col gap-1">
              <span className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest">Date</span>
              <span className="text-xs text-neutral-300 font-bold uppercase">{formatDate(workshop.date)}</span>
            </div>
            <div className="bg-black p-3 flex flex-col gap-1">
              <span className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest">Time</span>
              <span className="text-xs text-neutral-300 font-bold uppercase">{workshop.time}</span>
            </div>
            <div className="bg-black p-3 flex flex-col gap-1">
              <span className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest">Loc</span>
              <span className="text-xs text-neutral-300 font-bold uppercase truncate">{workshop.location}</span>
            </div>
            <div className="bg-black p-3 flex flex-col gap-1">
              <span className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest">Seats</span>
              <span className={`text-xs font-bold uppercase ${isAlmostFull ? 'text-red-600' : 'text-neutral-300'}`}>
                {workshop.availableSeats} / {workshop.totalSeats}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Action Footer */}
        <div className={`border-t ${BORDER_COLOR} p-6 bg-neutral-950 group-hover:bg-black transition-colors`}>
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-neutral-500 tracking-widest mb-1 font-mono">Investment</span>
              <div className="flex items-baseline gap-3">
                <span className={`text-2xl font-black tracking-tight ${isSoldOut ? 'text-neutral-700' : 'text-white'}`}>
                  ₹{finalPrice.toLocaleString("en-IN")}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-neutral-600 line-through decoration-red-600 font-mono">
                    ₹{workshop.price.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>

            {/* Visual Action Button */}
            <div className={`flex items-center gap-2 px-6 py-3 border transition-all duration-300 ${
              isSoldOut 
                ? "border-neutral-800 text-neutral-700" 
                : "border-white text-white group-hover:bg-white group-hover:text-black"
            }`}>
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isSoldOut ? "Closed" : "Register"}
              </span>
              {!isSoldOut && (
                <motion.div variants={buttonVariants}>
                  <ArrowRight className="w-3 h-3" />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}