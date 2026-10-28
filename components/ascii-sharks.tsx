"use client";

import { useEffect, useRef } from "react";
import { OceanEngine } from "@/components/ascii-ocean/engine";

// ASCII ocean from github.com/stackedlol/ascii-sharks (MIT), vendored in components/ascii-ocean.
export function AsciiSharks() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const engine = new OceanEngine(canvas, [
      { kind: "hammerhead", size: 1 },
      { kind: "classic", size: 0.9 },
      { kind: "hammerhead", size: 0.85 },
      { kind: "classic", size: 0.8 },
    ]);
    return () => engine.destroy();
  }, []);

  return <canvas ref={ref} className="ascii-sharks" aria-hidden="true" />;
}
