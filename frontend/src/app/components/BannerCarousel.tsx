import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface BannerItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  image: string;
  gradient: string;
  buttonTextColor: string;
  buttonHoverBg?: string;
  onClick: () => void;
}

interface BannerCarouselProps {
  banners: BannerItem[];
  autoplayInterval?: number;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  autoplayInterval = 4500,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Single banner card per slide across all devices (Desktop, Tablet, Mobile)
  const updateItemsPerPage = useCallback(() => {
    setItemsPerPage(1);
  }, []);

  useEffect(() => {
    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, [updateItemsPerPage]);

  const maxIndex = Math.max(0, banners.length - itemsPerPage);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Autoplay
  useEffect(() => {
    if (isHovered || isDragging || banners.length <= itemsPerPage) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoplayInterval);
    return () => clearInterval(timer);
  }, [isHovered, isDragging, banners.length, itemsPerPage, autoplayInterval, nextSlide]);

  // Touch / Drag Handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - dragStartX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -50) {
      nextSlide();
    } else if (dragOffset > 50) {
      prevSlide();
    }
    setDragOffset(0);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  // Calculate slide pagination count for dots
  const totalPages = Math.ceil(banners.length / itemsPerPage);
  const activeDotIndex = Math.min(
    totalPages - 1,
    Math.floor(currentIndex / itemsPerPage)
  );

  return (
    <div
      className="relative my-4 group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsDragging(false);
        setDragOffset(0);
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Slider Container Window */}
      <div
        ref={containerRef}
        className="overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(calc(-${(currentIndex * 100) / itemsPerPage}% + ${dragOffset}px))`,
            transitionProperty: isDragging ? 'none' : 'transform',
          }}
        >
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="px-1 sm:px-2 flex-shrink-0"
              style={{ width: `${100 / itemsPerPage}%` }}
            >
              <div
                className="h-52 sm:h-64 lg:h-72 rounded-2xl overflow-hidden border-0 relative shadow-md hover:shadow-lg transition-all group/card cursor-pointer"
                onClick={() => {
                  if (Math.abs(dragOffset) < 5) {
                    banner.onClick();
                  }
                }}
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500 pointer-events-none"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: banner.gradient }}
                />
                <div className="relative h-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 z-10">
                  <div className="max-w-md sm:max-w-lg">
                    <span className="inline-block bg-white/25 text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-full mb-3 backdrop-blur-md shadow-xs">
                      {banner.badge}
                    </span>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-xs">
                      {banner.title}
                    </h3>
                    <p className="text-sm sm:text-base text-white/95 mt-1.5 font-medium">
                      {banner.subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      banner.onClick();
                    }}
                    className="self-start bg-white text-sm sm:text-base font-extrabold px-6 py-2.5 rounded-full shadow-lg hover:opacity-95 hover:scale-105 transition-all transform active:scale-95 mt-4"
                    style={{ color: banner.buttonTextColor }}
                  >
                    {banner.buttonText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Left Navigation Arrow */}
      {banners.length > itemsPerPage && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous banner"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 focus:outline-none hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          {/* Right Navigation Arrow */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next banner"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 focus:outline-none hover:scale-110"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-3">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? 'w-6 bg-orange-500'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
