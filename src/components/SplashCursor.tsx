import React, { useEffect, useRef, useSyncExternalStore } from 'react';

interface SplashCursorProps {
  enabled?: boolean;
  rainbowMode?: boolean;
  color?: string;
  splatForce?: number;
  curl?: number;
}

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export const SplashCursor: React.FC<SplashCursorProps> = ({
  enabled = true,
  rainbowMode = false,
  color = '#f5c6d6',
  splatForce = 1.5,
  curl = 0.3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mounted = useHydrated();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Disable on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      size: number;
      color: string;
    }> = [];

    const getColor = () => {
      if (rainbowMode) {
        const hue = Math.random() * 360;
        return `hsl(${hue}, 100%, 60%)`;
      }
      return color;
    };

    const addParticles = (x: number, y: number) => {
      const particleCount = 12;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const speed = Math.random() * splatForce + 1;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          size: Math.random() * 4 + 2,
          color: getColor(),
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Apply physics
        p.vy += 0.15; // gravity
        p.vx *= 0.98; // friction
        p.vy *= 0.98;

        // Apply curl
        const angle = Math.atan2(p.vy, p.vx);
        const curveAmount = curl * 0.02;
        p.vx = Math.cos(angle + curveAmount) * Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        p.vy = Math.sin(angle + curveAmount) * Math.sqrt(p.vx * p.vx + p.vy * p.vy);

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Fade out
        p.life -= 0.015;

        // Draw particle
        const radius = Math.max(0, p.size * p.life);
        if (radius > 0) {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Remove dead particles
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      addParticles(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled, rainbowMode, color, splatForce, curl]);

  // Only render canvas on client after mount to avoid hydration mismatch
  if (!mounted) {
    return <canvas ref={canvasRef} style={{ display: 'none' }} />;
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
};
