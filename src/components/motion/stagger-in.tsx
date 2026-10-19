"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP);

/**
 * Subtle entrance for dashboard lists (S-02): children marked `data-animate` fade/slide in with a short stagger.
 * Never used on exam screens (D-015). Skipped entirely when the OS "reduce motion" setting is on.
 */
export function StaggerIn({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-animate]", { opacity: 0, y: 8, duration: 0.35, ease: "power2.out", stagger: 0.04, clearProps: "all" });
      });
      return () => mm.revert();
    },
    { scope: root },
  );
  return <div ref={root} className={className}>{children}</div>;
}
