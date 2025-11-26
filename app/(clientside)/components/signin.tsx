"use client";
import { signIn } from "@/auth"; 
import { ArrowRight } from "lucide-react";
import { motion, Variants } from "framer-motion"; // 1. Import Variants

// 2. Add : Variants type annotation here
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// 3. Add : Variants type annotation here
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

export default function SignIn() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated Background Grid */}
      <motion.div 
        animate={{ 
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{ 
          duration: 40, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute inset-0 bg-[linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" 
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10 border border-neutral-800 bg-black/50 backdrop-blur-xl shadow-2xl"
      >
        {/* Card Header */}
        <motion.div variants={itemVariants} className="border-b border-neutral-800 p-8 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
            Eustress
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="text-red-600 inline-block"
            >
              .
            </motion.span>
          </h1>
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-[0.2em]">Member Access</p>
        </motion.div>

        {/* Card Body */}
        <div className="p-8 space-y-8">
          <motion.div variants={itemVariants} className="text-center space-y-2">
             <p className="text-neutral-400 text-sm leading-relaxed">
               Sign in to manage your workshop registrations and access exclusive coaching content.
             </p>
          </motion.div>

          {/* Form wrapper */}
          <motion.div variants={itemVariants}>
            <form
              action={async () => {
                await signIn("google");
              }}
            >
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="group w-full flex items-center justify-between bg-white text-black hover:bg-red-600 hover:text-white border border-transparent transition-all duration-300 px-6 py-4"
              >
                <span className="font-bold uppercase tracking-wider text-sm">Continue with Google</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </motion.button>
            </form>
          </motion.div>
          
          <motion.div variants={itemVariants} className="text-center">
             <p className="text-[10px] text-neutral-600 uppercase tracking-widest flex items-center justify-center gap-2">
               <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
               Secure Authentication
             </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}