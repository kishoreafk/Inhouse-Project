import { useEffect, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const ParticleBackground = () => {
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }, []);

  const options = useMemo(
    () => ({
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      particles: {
        color: { value: "#ffffff" },
        links: {
          color: "#ffffff",
          distance: 200,
          enable: true,
          opacity: 0.5,
          width: 2,
        },
        move: {
          enable: true,
          speed: 3,
        },
        number: {
          density: { enable: true },
          value: 100,
        },
        opacity: { value: 0.8 },
        size: { value: { min: 3, max: 8 } },
      },
    }),
    []
  );

  return <Particles options={options} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
};

export default ParticleBackground;
