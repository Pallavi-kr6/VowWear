import React from 'react';
import { motion } from 'framer-motion';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Select Your Event',
      description:
        'Pick your occasion and vibe — from Haldi mornings to elegant receptions.',
    },
    {
      number: '02',
      title: 'Get AI Suggestions',
      description:
        'We curate outfit ideas tailored to your mood, style, and celebration.',
    },
    {
      number: '03',
      title: 'Compare & Shop',
      description:
        'Browse, compare, and shop seamlessly from top platforms in seconds.',
    },
  ];

  return (
    <section className="relative w-full py-28 px-6 bg-[#F8F8F4] overflow-hidden">

      {/* 🌿 background glow */}
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-[#B7F34D] opacity-10 blur-3xl rounded-full"></div>

      {/* Header */}
      <div className="text-center mb-24 max-w-xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-semibold text-[#1E2D38] mb-4 tracking-tight">
          How it works
        </h2>
        <p className="text-gray-500 text-lg">
          A smoother way to discover your perfect look
        </p>
      </div>

      {/* Steps Wrapper */}
      <div className="relative max-w-6xl mx-auto">

        {/* ✨ Connector line (behind cards) */}
        <div className="hidden md:block absolute top-[45%] left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#1E2D38]/15 to-transparent"></div>

        <div className="grid md:grid-cols-3 gap-12 relative z-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
                ease: 'easeOut',
              }}
              viewport={{ once: true }}
              className={`relative ${
                index === 1 ? 'md:mt-14' : ''
              }`}
            >
              {/* ✨ Dot aligned to line */}
              <div className="hidden md:flex absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                <div className="w-4 h-4 rounded-full bg-[#B7F34D] border-4 border-white shadow-md"></div>
              </div>

              {/* Card */}
              <div className="group h-full p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-black/5 shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_70px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">

                {/* Step number */}
                <div className="text-xs text-gray-400 mb-4 tracking-[0.2em]">
                  {step.number}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-[#1E2D38] mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 leading-relaxed text-sm">
                  {step.description}
                </p>

                {/* Accent line */}
                <div className="mt-6 h-[2px] w-0 bg-[#B7F34D] group-hover:w-12 transition-all duration-300 rounded-full"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-24">
        <motion.button
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.96 }}
          className="px-10 py-4 rounded-full font-medium transition-all bg-[#1E2D38] text-[#B7F34D] shadow-lg hover:shadow-2xl"
        >
          Start Exploring →
        </motion.button>
      </div>
    </section>
  );
};