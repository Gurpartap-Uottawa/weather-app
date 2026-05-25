"use client";
import { useEffect, useRef } from "react";

type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  maxLife: number;
}

export function SparklesCore({
  id,
  className = "",
  background = "transparent",
  minSize = 0.4,
  maxSize = 1.2,
  speed = 1,
  particleColor = "#FFFFFF",
  particleDensity = 80,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const r = parseInt(particleColor.slice(1, 3), 16);
    const g = parseInt(particleColor.slice(3, 5), 16);
    const b = parseInt(particleColor.slice(5, 7), 16);

    const spawn = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: minSize + Math.random() * (maxSize - minSize),
      speedX: (Math.random() - 0.5) * speed * 0.3,
      speedY: (Math.random() - 0.5) * speed * 0.3,
      life: 0,
      maxLife: 120 + Math.random() * 120,
    });

    resize();
    const count = Math.floor((canvas.width * canvas.height * particleDensity) / 40000);
    for (let i = 0; i < count; i++) particles.push(spawn());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.map((p) => {
        p.life++;
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.life >= p.maxLife) return spawn();
        const t = p.life / p.maxLife;
        const alpha = t < 0.2 ? t / 0.2 : t > 0.8 ? (1 - t) / 0.2 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${(alpha * 0.9).toFixed(3)})`;
        ctx.fill();
        return p;
      });
      animId = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [minSize, maxSize, speed, particleColor, particleDensity]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={className}
      style={{ background }}
    />
  );
}
