// components/CornerDecoration.tsx

export default function CornerDecoration({
  position,
}: {
  position: 'top-left' | 'bottom-right';
}) {
  return (
    <div
      className={`pointer-events-none fixed z-0 ${
        position === 'top-left'
          ? 'top-0 left-0'
          : 'bottom-0 right-0 rotate-180'
      }`}
    >
      <div className="relative w-[320px] h-[320px]">
        {/* Glow */}
        <div className="absolute w-[260px] h-[260px] bg-yellow-300/20 blur-3xl rounded-full top-0 left-0"></div>

        {/* Mandala */}
        <svg
          width="280"
          height="280"
          viewBox="0 0 200 200"
          className="absolute animate-spin-slow opacity-50"
        >
          <g fill="none" stroke="#D4AF37" strokeWidth="1.2">
            <circle cx="100" cy="100" r="80" />
            <circle cx="100" cy="100" r="60" />

            {[...Array(16)].map((_, i) => (
              <ellipse
                key={i}
                cx="100"
                cy="40"
                rx="10"
                ry="40"
                transform={`rotate(${i * 22.5} 100 100)`}
              />
            ))}

            <circle cx="100" cy="100" r="20" />
          </g>
        </svg>

        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
            style={{
              top: `${20 + i * 30}px`,
              left: `${40 + i * 25}px`,
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}