import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import React from 'react';
import type { JSX } from 'react';

import { FiFileText } from 'react-icons/fi';
import { MdOutlineRocketLaunch } from "react-icons/md";
import { LuWrench } from "react-icons/lu";
import { SiMaterialdesignicons } from "react-icons/si";

export interface CarouselItem {
  title: string;
  description: string;
  id: number;
  icon: React.ReactNode;
  bgImg?: string;
}

export interface CarouselProps {
  items?: CarouselItem[];
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
}

const DEFAULT_ITEMS: CarouselItem[] = [
  {
    title: 'Project Planning & Scope Definition',
    description: 'Outline goals, deliverables, timeline, and constraints. Align stakeholders and define success metrics.',
    id: 1,
    icon: <FiFileText className="h-[18px] w-[18px] text-white" />,
    bgImg: 'https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg'
  },
  {
    title: 'System Design & Architecture',
    description: 'Create software components, and data flow. Choose technologies and define interfaces.',
    id: 2,
    icon: <SiMaterialdesignicons className="h-[16px] w-[16px] text-white" />,
    bgImg: 'https://images.pexels.com/photos/3862370/pexels-photo-3862370.jpeg'
  },
  {
    title: 'Development & Implementation',
    description: 'Write, integrate, and test code. Follow agile practices to ensure iterative progress and early feedback.',
    id: 3,
    icon: <LuWrench className="h-[18px] w-[18px] text-white" />,
    bgImg: 'https://images.pexels.com/photos/7651922/pexels-photo-7651922.jpeg'
  },
  {
    title: 'Deployment',
    description: 'Perform QA, fix bugs, and deploy to production. Monitor performance and ensure system stability post-launch.',
    id: 4,
    icon: <MdOutlineRocketLaunch className="h-[18px] w-[18px] text-white" />,
    bgImg: 'https://images.pexels.com/photos/8348468/pexels-photo-8348468.jpeg'
  }
];

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS: { type: 'spring'; stiffness: number; damping: number } = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export default function Carousel({
  items = DEFAULT_ITEMS,
  baseWidth = 600,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false
}: CarouselProps): JSX.Element {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const carouselItems = loop ? [...items, items[0]] : items;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev === items.length - 1 && loop) {
            return prev + 1;
          }
          if (prev === carouselItems.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [autoplay, autoplayDelay, isHovered, loop, items.length, carouselItems.length, pauseOnHover]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(prev => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(items.length - 1);
      } else {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
      }
    }
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * (carouselItems.length - 1),
          right: 0
        }
      };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden p-4 ${
        round ? 'rounded-full border-white/85 border' : 'rounded-[24px] bg-black/60 border-white/55 border shadow-[0px_0px_65px_1px_rgba(255,255,255,0.1)]'
      }`}
      style={{
        width: `${baseWidth}px`,
        ...(round && { height: `${baseWidth}px` })
      }}
    >
      <motion.div
        className="flex"
        drag="x" 
        {...dragProps}
        style={{
          height: itemWidth / 1.6,
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
          x
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => {
          const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset];
          const outputRange = [90, 0, -90];
          const rotateY = useTransform(x, range, outputRange, { clamp: false });
          return (
            <motion.div
              key={index}
              className={`relative shrink-0 flex flex-col ${
                round
                  ? 'items-center justify-center text-center bg-[#060010] border-0'
                  : 'items-start justify-between bg-[#222] border-white/45 border rounded-[12px]'
              } overflow-hidden cursor-grab active:cursor-grabbing`}
              style={{
                backgroundImage: `url(${item.bgImg})`,
                boxShadow: '0 0 300px rgba(0,0,0,1) inset, 0 0 500px rgba(0,0,0,0.7) inset',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                width: itemWidth,
                height: round ? itemWidth : '100%',
                rotateY: rotateY,
                ...(round && { borderRadius: '50%' })
              }}
              transition={effectiveTransition}
            >
              <div className={`${round ? 'p-0 m-0' : 'mb-4 p-5'}`}>
                <span className="flex items-center justify-center rounded-full size-13 backdrop-blur-xs border border-white/30 hover:bg-white/20 cursor-pointer"
                      onClick={() => window.open('https://github.com/repo-so', '_blank')}>
                  {item.icon}
                </span>
              </div>
              <div className="p-5 w-[70%]">
                <div className="mb-1 font-semibold text-lg text-white drop-shadow-lg drop-shadow-black">{item.title}</div>
                <p className="text-sm text-white drop-shadow-lg drop-shadow-black ">{item.description}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      <div className={`flex w-full justify-center ${round ? 'absolute z-20 bottom-12 left-1/2 -translate-x-1/2' : ''}`}>
        <div className="mt-4.5 flex w-[130px] justify-between px-8">
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 ${
                currentIndex % items.length === index
                  ? round
                    ? 'bg-white'
                    : 'bg-white/85'
                  : round
                    ? 'bg-[#555]'
                    : 'bg-[#525252]'
              }`}
              animate={{
                scale: currentIndex % items.length === index ? 1.3 : 1
              }}
              onClick={() => setCurrentIndex(index)}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
