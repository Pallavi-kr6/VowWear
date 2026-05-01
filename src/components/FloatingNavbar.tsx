import React from "react";
import { motion } from "framer-motion";

export const FloatingNavbar: React.FC = () => {
  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.15)]">

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 rounded-full text-sm font-medium transition-all hover:shadow-[0_0_20px_rgba(183,243,77,0.4)]"
          style={{
            background: "#7ee16f",
            color: "#0c0c0b",
          }}
        >
          Get Started
        </motion.button>

      </div>
    </motion.div>
  );
};