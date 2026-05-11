"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useState } from "react";

/** Fixed design canvas (16:9), same as Figma / Luna scaled-viewport pattern. */
export const DESIGN_PX_W = 2560;
export const DESIGN_PX_H = 1440;

type Props = {
  children: ReactNode;
};

/**
 * Full-window letterbox: inner stage is 2560×1440 design space (160rem × 90rem at 16px root),
 * uniformly scaled with `transform: scale(...)` so layout stays design-true.
 */
export function ScaledViewport({ children }: Props) {
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    function update() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const s = Math.min(w / DESIGN_PX_W, h / DESIGN_PX_H);
      setScale(Number.isFinite(s) && s > 0 ? s : 1);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="svp-root">
      <div
        className="svp-stage"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
