// components/FlowerDecoration.tsx

import { useState } from "react";

export default function FlowerDecoration({
  position,
}: {
  position: "top-right" | "bottom-left";
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`fixed z-0 ${
        position === "top-right"
          ? "top-10 right-10"
          : "bottom-10 left-10"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg
        width="120"
        height="120"
        viewBox="0 0 200 200"
        className={`transition-transform duration-500 ${
          hovered ? "scale-110 rotate-12" : "scale-100"
        }`}
      >
        {/* petals */}
        <g fill="#7ED957" opacity="0.8">
          {[...Array(6)].map((_, i) => (
            <ellipse
              key={i}
              cx="100"
              cy="60"
              rx="20"
              ry="40"
              transform={`rotate(${i * 60} 100 100)`}
            />
          ))}
        </g>

        {/* center */}
        <circle cx="100" cy="100" r="20" fill="#FFD166" />

        {/* stem */}
        <line
          x1="100"
          y1="120"
          x2="100"
          y2="180"
          stroke="#3A7D44"
          strokeWidth="4"
        />
      </svg>
    </div>
  );
}