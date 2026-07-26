"use client";

import { useId, useMemo } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import type { Container, Engine, ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { motion, useAnimation } from "motion/react";

import { cn } from "@/lib/utils";

export type SparklesCoreProps = {
  id?: string;
  className?: string;
  background?: string;
  particleSize?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

async function initializeParticles(engine: Engine): Promise<void> {
  await loadSlim(engine);
}

export function SparklesCore({
  id,
  className,
  background = "#0d47a1",
  particleSize,
  minSize,
  maxSize,
  speed = 4,
  particleColor = "#ffffff",
  particleDensity = 120,
}: SparklesCoreProps) {
  const controls = useAnimation();
  const generatedId = useId();

  const options = useMemo<ISourceOptions>(
    () => ({
      background: {
        color: {
          value: background,
        },
      },
      detectRetina: true,
      fpsLimit: 120,
      fullScreen: {
        enable: false,
        zIndex: 1,
      },
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: false,
            mode: "repulse",
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
        },
      },
      particles: {
        collisions: {
          enable: false,
        },
        color: {
          value: particleColor,
        },
        links: {
          enable: false,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "out",
          },
          random: false,
          speed: {
            min: 0.1,
            max: 1,
          },
          straight: false,
        },
        number: {
          density: {
            enable: true,
            width: 400,
            height: 400,
          },
          value: particleDensity,
        },
        opacity: {
          value: {
            min: 0.1,
            max: 1,
          },
          animation: {
            enable: true,
            speed,
            sync: false,
            startValue: "random",
          },
        },
        shape: {
          type: "circle",
        },
        size: {
          value: {
            min: minSize ?? particleSize ?? 1,
            max: maxSize ?? particleSize ?? 3,
          },
        },
      },
    }),
    [
      background,
      maxSize,
      minSize,
      particleColor,
      particleDensity,
      particleSize,
      speed,
    ],
  );

  const handleParticlesLoaded = async (
    container?: Container,
  ): Promise<void> => {
    if (!container) {
      return;
    }

    await controls.start({
      opacity: 1,
      transition: {
        duration: 1,
      },
    });
  };

  return (
    <ParticlesProvider init={initializeParticles}>
      <motion.div animate={controls} className={cn("opacity-0", className)}>
        <Particles
          id={id ?? generatedId}
          className="h-screen w-full"
          options={options}
          particlesLoaded={handleParticlesLoaded}
        />
      </motion.div>
    </ParticlesProvider>
  );
}