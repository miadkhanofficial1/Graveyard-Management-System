import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const IslamicSplashLoader: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Non-intrusive serene timer (~1.3s)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1350);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="islamic-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] backdrop-blur-3xl bg-[#070B14]/95 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden"
        >
          {/* Luminous Ambient Background Glow */}
          <div className="absolute w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none -top-12 animate-pulse" />
          <div className="absolute w-80 h-80 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none bottom-0" />

          {/* Centerpiece Container */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 space-y-5">
            {/* Rub El Hizb (8-Point Islamic Star) & Crescent Moon Emblem */}
            <motion.div
              initial={{ scale: 0.75, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 24,
                mass: 0.8,
              }}
              className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-amber-500/10 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.35)] backdrop-blur-2xl"
            >
              {/* Outer Rotating Subtle Octagram Guide */}
              <div className="absolute inset-1.5 rounded-2xl border border-emerald-400/20 rotate-45 pointer-events-none" />
              <div className="absolute inset-1.5 rounded-2xl border border-emerald-400/20 rotate-0 pointer-events-none" />

              {/* Rub El Hizb / Crescent SVG Icon */}
              <svg
                className="w-10 h-10 text-emerald-400 filter drop-shadow-[0_0_12px_rgba(52,211,153,0.7)]"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Crescent Moon */}
                <path
                  d="M24 6C16.82 6 11 11.82 11 19C11 26.18 16.82 32 24 32C25.44 32 26.83 31.76 28.12 31.33C24.47 30.12 21.8 26.68 21.8 22.6C21.8 18.52 24.47 15.08 28.12 13.87C26.83 13.44 25.44 13.2 24 13.2C19.7 13.2 16.2 16.7 16.2 21C16.2 25.3 19.7 28.8 24 28.8C25.3 28.8 26.5 28.48 27.56 27.91C25.36 29.21 22.77 30 20 30C12.82 30 7 24.18 7 17C7 10.4 11.92 4.93 18.27 4.1C16.42 5.86 15.2 8.32 15.2 11.08C15.2 16.6 19.68 21.08 25.2 21.08C27.96 21.08 30.42 19.86 32.18 18.01C31.35 24.36 25.88 29.28 19.28 29.28"
                  fill="url(#crescentGlow)"
                  opacity="0.9"
                />
                {/* 8-pointed Islamic Star in Center */}
                <path
                  d="M31 16L32.2 19.2L35.4 18L34.2 21.2L37.4 22.4L34.2 23.6L35.4 26.8L32.2 25.6L31 28.8L29.8 25.6L26.6 26.8L27.8 23.6L24.6 22.4L27.8 21.2L26.6 18L29.8 19.2L31 16Z"
                  fill="#F59E0B"
                  className="filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                />
                <defs>
                  <linearGradient id="crescentGlow" x1="7" y1="4" x2="33" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#34D399" />
                    <stop offset="0.6" stopColor="#10B981" />
                    <stop offset="1" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            {/* Arabic Dignified Bismillah Calligraphy */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="space-y-1"
            >
              <div
                dir="rtl"
                className="font-serif text-lg sm:text-xl text-emerald-300/90 font-medium tracking-wide drop-shadow-[0_0_10px_rgba(110,231,183,0.3)]"
                style={{ fontFamily: "'Noto Sans Bengali', 'Amiri', 'Traditional Arabic', serif" }}
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>

              {/* Title & Tagline */}
              <div className="pt-1 flex items-center justify-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-white">
                  Graveyard<span className="text-emerald-400">Track</span>™
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                  • Spatial Memorial System
                </span>
              </div>
            </motion.div>

            {/* Shimmering Progress Hairline */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 140, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.85, ease: 'easeInOut' }}
              className="h-[2px] rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
