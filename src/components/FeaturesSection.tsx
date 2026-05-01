import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface TimelineItem {
  year: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const timelineItems: TimelineItem[] = [
  {
    year: '2024',
    title: 'AI Outfit Recommendations',
    description:
      'Get personalized outfit suggestions powered by advanced AI algorithms tailored to your style preferences.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    year: '2023',
    title: 'Multi-Platform Price Comparison',
    description:
      'Compare prices across Myntra, Ajio, Amazon, and Flipkart to get the best deals.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-3 0-3 4 0 4s3 4 0 4m0-8v8" />
      </svg>
    ),
  },
  {
    year: '2022',
    title: 'Personalized Styling',
    description:
      'Recommendations based on skin tone, body type, and personal fashion preferences.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    year: '2021',
    title: 'Save & Plan Outfits',
    description:
      'Organize and plan your complete wardrobe with smart collections.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="5" y="5" width="14" height="14" strokeWidth="1.5" />
      </svg>
    ),
  },
];

function TimelineItemComponent({ item, index, isLeft }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative flex mb-16"
      style={{ justifyContent: isLeft ? 'flex-start' : 'flex-end' }}
    >
      {/* Timeline Dot */}
      <div className="absolute left-1/2 -translate-x-1/2 top-6 z-10">
        <div className="w-4 h-4 rounded-full bg-[#B7F34D] border-2 border-[#B7F34D] shadow-[0_0_20px_rgba(183,243,77,0.6)]" />
      </div>

      {/* Card */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        className="w-[45%] p-6 rounded-2xl backdrop-blur-md"
        style={{
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(36,55,70,0.08)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        }}
      >
        {/* Icon */}
        <div className="w-10 h-10 flex items-center justify-center rounded-lg mb-4"
          style={{
            background: '#243746',
            color: '#B7F34D',
          }}
        >
          {item.icon}
        </div>

        {/* Year */}
        <div className="text-xs font-semibold tracking-wider text-[#8FBF3F] mb-2">
          {item.year}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-[#243746] mb-2">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">
          {item.description}
        </p>
      </motion.div>
    </motion.div>
  );
}

export const FeaturesSection = () => {
  return (
    <section className="relative w-full py-24 px-6 bg-[#F5F5E9] overflow-hidden">

      {/* Subtle green blob (hero match) */}
      <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-[#B7F34D] opacity-10 blur-3xl rounded-full"></div>

      {/* Header */}
      <div className="text-center mb-20 max-w-2xl mx-auto">
        <h2 className="text-5xl font-semibold text-[#243746] mb-4 tracking-tight">
          Powerful Features
        </h2>
        <p className="text-gray-600 text-lg">
          Everything you need to find your perfect outfit
        </p>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto relative">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#243746]/10 -translate-x-1/2"></div>

        {timelineItems.map((item, index) => (
          <TimelineItemComponent
            key={index}
            item={item}
            index={index}
            isLeft={index % 2 === 0}
          />
        ))}
      </div>
    </section>
  );
};