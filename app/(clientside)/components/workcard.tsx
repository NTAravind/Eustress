"use client";
import React from "react";
import { Workshop } from "@/app/generated/prisma";
import { Calendar, Clock, MapPin, Users, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface WorkshopCardProps {
  workshop: Workshop;
}

export function WorkshopCard({ workshop }: WorkshopCardProps) {
  const finalPrice =
    workshop.price - (workshop.price * workshop.discount) / 100;
  const hasDiscount = workshop.discount > 0;
  const occupancyPercentage =
    ((workshop.totalSeats - workshop.availableSeats) / workshop.totalSeats) *
    100;
  const isAlmostFull = occupancyPercentage >= 80;
  const isSoldOut = workshop.availableSeats === 0;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Styles
  const BORDER_COLOR = "border-neutral-800";

  // If sold out, we might want to disable the link or keep it to show details
  const Wrapper = isSoldOut ? "div" : Link;

  return (
    <Link
      href={`/workshops/${workshop.id}`}
      className={`group block h-full focus:outline-none`}
    >
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`flex flex-col bg-black border ${BORDER_COLOR} group-hover:border-red-600 transition-colors duration-300 h-full relative`}
      >
        {/* 1. Image Section */}
        <div
          className={`relative h-64 w-full border-b ${BORDER_COLOR} overflow-hidden bg-neutral-900`}
        >
          <Image
            src={workshop.thumbnail}
            alt={workshop.title}
            fill
            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Status Flags */}
          <div className="absolute top-0 left-0 flex flex-col gap-0 z-10">
            {hasDiscount && (
              <div className="bg-white text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                -{workshop.discount}%
              </div>
            )}
            {isAlmostFull && !isSoldOut && (
              <div className="bg-red-600 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                Limited Seats
              </div>
            )}
            {isSoldOut && (
              <div className="bg-neutral-800 text-neutral-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                Sold Out
              </div>
            )}
          </div>
        </div>

        {/* 2. Content Section */}
        <div className="flex-1 p-8 flex flex-col">
          <h3 className="text-2xl font-black uppercase leading-[0.9] mb-4 text-white group-hover:text-red-600 transition-colors">
            {workshop.title}
          </h3>

          <p className="text-sm text-neutral-400 line-clamp-2 mb-8 leading-relaxed font-light group-hover:text-neutral-300 transition-colors">
            {workshop.description}
          </p>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-auto border-t border-neutral-900 pt-6 group-hover:border-neutral-800 transition-colors">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-red-600 mt-0.5" />
              <span className="text-xs font-bold uppercase text-neutral-300">
                {formatDate(workshop.date)}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-red-600 mt-0.5" />
              <span className="text-xs font-bold uppercase text-neutral-300">
                {workshop.time}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
              <span className="text-xs font-bold uppercase text-neutral-300 line-clamp-1">
                {workshop.location}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-red-600 mt-0.5" />
              <span className="text-xs font-bold uppercase text-neutral-300">
                {workshop.availableSeats}/{workshop.totalSeats} Seats
              </span>
            </div>
          </div>
        </div>

        {/* 3. Footer / Action */}
        <div
          className={`border-t ${BORDER_COLOR} p-6 bg-neutral-950 group-hover:bg-neutral-900 transition-colors`}
        >
          <div className="flex justify-between items-end mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-neutral-500 tracking-widest mb-1">
                Price
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  ₹{finalPrice.toLocaleString("en-IN")}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-neutral-600 line-through decoration-red-600">
                    ₹{workshop.price.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Visual "Button" - rendered as div to avoid nested interactive elements */}
          <div
            className={`w-full flex items-center justify-center gap-2 border border-white uppercase font-bold tracking-wider py-4 px-6 transition-all duration-300 ${
              isSoldOut
                ? "opacity-50 border-neutral-700 text-neutral-500 cursor-not-allowed"
                : "text-white group-hover:bg-white group-hover:text-black"
            }`}
          >
            {isSoldOut ? "Sold Out" : "Register"}
            {!isSoldOut && (
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}