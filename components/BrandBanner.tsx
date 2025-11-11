"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Brand {
  name: string;
  logo?: string; // Optional - can use text fallback
}

interface BrandBannerProps {
  brands: Brand[];
  autoRotateInterval?: number; // milliseconds
}

export default function BrandBanner({ 
  brands, 
  autoRotateInterval = 3000 
}: BrandBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate brands
  useEffect(() => {
    if (isPaused || brands.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % brands.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [autoRotateInterval, brands.length, isPaused]);

  // Show multiple brands at once (e.g., 5-6 visible)
  const visibleCount = 5;
  const visibleBrands = [];
  
  for (let i = 0; i < visibleCount; i++) {
    const index = (currentIndex + i) % brands.length;
    visibleBrands.push({ ...brands[index], displayIndex: i });
  }

  return (
    <section className="py-12 bg-gray-50 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Compare 100's of Boots from Major Brands
          </h2>
        </motion.div>

        {/* Brand Logos Container */}
        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex items-center justify-center gap-8 md:gap-12 lg:gap-16 flex-wrap">
            {visibleBrands.map((brand, index) => (
              <motion.div
                key={`${brand.name}-${currentIndex}-${index}`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeInOut"
                }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex-shrink-0"
              >
                <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback to text if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.brand-text-fallback')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'brand-text-fallback text-gray-400 font-bold text-lg md:text-xl lg:text-2xl';
                          fallback.textContent = brand.name;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 font-bold text-lg md:text-xl lg:text-2xl">
                      {brand.name}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

