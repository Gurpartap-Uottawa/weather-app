"use client";
import React, { useId, useCallback } from "react";
import Particles, { ParticlesProvider, useParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

function SparklesInner(props: ParticlesProps) {
  const { id, className, background, minSize, maxSize, speed, particleColor, particleDensity } = props;
  const { loaded } = useParticlesProvider();
  const generatedId = useId();

  return (
    <motion.div
      animate={{ opacity: loaded ? 1 : 0 }}
      transition={{ duration: 1 }}
      className={cn("opacity-0", className)}
    >
      {loaded && (
        <Particles
          id={id || generatedId}
          className="h-full w-full"
          options={{
            background: { color: { value: background || "transparent" } },
            fullScreen: { enable: false, zIndex: 1 },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: { enable: true, mode: "push" },
                onHover: { enable: false, mode: "repulse" },
                resize: true as any,
              },
              modes: {
                push: { quantity: 4 },
                repulse: { distance: 200, duration: 0.4 },
              },
            },
            particles: {
              color: {
                value: particleColor || "#ffffff",
              },
              move: {
                direction: "none",
                enable: true,
                outModes: { default: "out" },
                random: false,
                speed: { min: 0.1, max: 1 },
                straight: false,
              },
              number: {
                density: { enable: true, width: 400, height: 400 },
                value: particleDensity || 120,
              },
              opacity: {
                value: { min: 0.1, max: 1 },
                animation: {
                  enable: true,
                  speed: speed || 4,
                  sync: false,
                  startValue: "random",
                  destroy: "none",
                },
              },
              shape: { type: "circle" },
              size: {
                value: { min: minSize || 1, max: maxSize || 3 },
              },
              stroke: { width: 0 },
            },
            detectRetina: true,
          }}
        />
      )}
    </motion.div>
  );
}

export const SparklesCore = (props: ParticlesProps) => {
  const initEngine = useCallback(async (engine: Parameters<typeof loadSlim>[0]) => {
    await loadSlim(engine);
  }, []);

  return (
    <ParticlesProvider init={initEngine}>
      <SparklesInner {...props} />
    </ParticlesProvider>
  );
};
