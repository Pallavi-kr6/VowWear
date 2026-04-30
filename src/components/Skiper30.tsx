"use client";

import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import Lenis from "lenis";
import { useEffect, useRef, useState } from "react";

const images = [
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop",
   "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&auto=format&fit=crop",
];

const Skiper30 = () => {
  const gallery = useRef<HTMLDivElement>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ["start end", "end start"],
  });

  const { height } = dimension;
  const y = useTransform(scrollYProgress, [0, 1], [0, height * 2]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 3.3]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.25]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 3]);

  useEffect(() => {
    const lenis = new Lenis();

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    const resize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", resize);
    requestAnimationFrame(raf);
    resize();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className="w-full bg-[#fafdee] text-[#1F3A4B]">
      {/* TOP TEXT */}
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-semibold">
            Discover Styles That Match You
          </h2>
          <p className="mt-4 text-sm opacity-60">
            Scroll to explore AI-curated outfits
          </p>
        </div>
      </div>

      {/* PARALLAX GALLERY */}
      <div
        ref={gallery}
        className="relative flex h-[175vh] gap-[2vw] overflow-hidden bg-white p-[2vw]"
      >
<Column images={[images[0], images[1], images[2]]} y={y} />
<Column images={[images[3], images[4], images[5]]} y={y2} />
<Column images={[images[6], images[7], images[8]]} y={y3} />
<Column images={[images[9], images[10], images[11]]} y={y4} />
      </div>

      {/* BOTTOM TEXT */}
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-semibold">
            Your Personal AI Stylist
          </h2>
          <p className="mt-4 text-sm opacity-60">
            Get outfit recommendations instantly
          </p>
        </div>
      </div>
    </main>
  );
};

type ColumnProps = {
  images: string[];
  y: MotionValue<number>;
};

const Column = ({ images, y }: ColumnProps) => {
  return (
    <motion.div
      className="relative -top-[45%] flex h-full w-1/4 min-w-[250px] flex-col gap-[2vw] 
      first:top-[-45%] 
      [&:nth-child(2)]:top-[-95%] 
      [&:nth-child(3)]:top-[-45%] 
      [&:nth-child(4)]:top-[-75%]"
      style={{ y }}
    >
      {images.map((src, i) => (
        <div key={i} className="relative h-[300px] w-full overflow-hidden rounded-2xl">
          <img
            src={src}
            alt="fashion"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
          />
        </div>
      ))}
    </motion.div>
  );
};

export { Skiper30 };
