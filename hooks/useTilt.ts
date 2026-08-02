import { useEffect, useRef } from 'react';

/**
 * Hook that tracks mouse movement over a container and updates CSS variables for
 * tilt rotation (maxAngle degrees) and radial glow position.
 * It respects the prefers-reduced-motion media query.
 */
export function useTilt(maxAngle = 4) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return; // disable tilt if user prefers reduced motion

    let rafId: number;
    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const percentX = (x / rect.width) * 2 - 1; // -1 to 1
      const percentY = (y / rect.height) * 2 - 1;
      const rotateX = percentY * maxAngle; // invert for natural tilt
      const rotateY = -percentX * maxAngle;
      const glowX = (x / rect.width) * 100;
      const glowY = (y / rect.height) * 100;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.setProperty('--tilt-rotate-x', `${rotateX}deg`);
        el.style.setProperty('--tilt-rotate-y', `${rotateY}deg`);
        el.style.setProperty('--glow-x', `${glowX}%`);
        el.style.setProperty('--glow-y', `${glowY}%`);
      });
    };
    const onMouseLeave = () => {
      cancelAnimationFrame(rafId);
      el.style.setProperty('--tilt-rotate-x', '0deg');
      el.style.setProperty('--tilt-rotate-y', '0deg');
    };
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [maxAngle]);

  return containerRef;
}
