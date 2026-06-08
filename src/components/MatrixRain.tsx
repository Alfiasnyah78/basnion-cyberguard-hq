import { useEffect, useRef } from "react";

/** Matrix rain canvas background — purely decorative */
export function MatrixRain({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);
    const fontSize = 14;
    let columns = Math.floor(w / fontSize);
    const drops: number[] = Array(columns).fill(1);
    const chars = "01ABCDEF{}#$%*<>/[]_basnionCTFHARBASONION".split("");

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      columns = Math.floor(w / fontSize);
      drops.length = columns;
      drops.fill(1);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 55) {
        last = t;
        ctx.fillStyle = "rgba(10, 18, 14, 0.08)";
        ctx.fillRect(0, 0, w, h);
        ctx.font = `${fontSize}px JetBrains Mono, monospace`;
        for (let i = 0; i < drops.length; i++) {
          const text = chars[Math.floor(Math.random() * chars.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;
          ctx.fillStyle = Math.random() > 0.97 ? "#bfffd6" : "#39ff88";
          ctx.fillText(text, x, y);
          if (y > h && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={ref} className={`pointer-events-none ${className}`} />;
}
