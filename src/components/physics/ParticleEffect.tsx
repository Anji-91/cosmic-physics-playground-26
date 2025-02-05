import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface ParticleEffectProps {
  x: number;
  y: number;
}

export const ParticleEffect = ({ x, y }: ParticleEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const createParticles = () => {
      const particles: Particle[] = [];
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * 2,
          vy: Math.sin(angle) * 2,
          life: 1,
        });
      }
      return particles;
    };

    particlesRef.current = createParticles();

    const animate = () => {
      if (!ctx || !canvasRef.current) return;

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      particlesRef.current.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;

        if (particle.life <= 0) {
          particlesRef.current.splice(i, 1);
          return;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.life})`;
        ctx.fill();
      });

      if (particlesRef.current.length > 0) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [x, y]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="absolute top-0 left-0 pointer-events-none"
    />
  );
};