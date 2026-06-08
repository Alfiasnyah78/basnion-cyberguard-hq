import { useEffect, useState } from "react";

export function Terminal({
  lines,
  loop = false,
  className = "",
}: {
  lines: string[];
  loop?: boolean;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (lineIdx >= lines.length) {
      if (loop) {
        const t = setTimeout(() => {
          setDisplayed([]); setCurrent(""); setLineIdx(0); setCharIdx(0);
        }, 2500);
        return () => clearTimeout(t);
      }
      return;
    }
    const line = lines[lineIdx];
    if (charIdx <= line.length) {
      const t = setTimeout(() => {
        setCurrent(line.slice(0, charIdx));
        setCharIdx(c => c + 1);
      }, 28);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setDisplayed(d => [...d, line]);
        setCurrent("");
        setCharIdx(0);
        setLineIdx(i => i + 1);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [charIdx, lineIdx, lines, loop]);

  return (
    <div className={`font-mono text-sm leading-relaxed ${className}`}>
      {displayed.map((l, i) => (
        <div key={i} className="text-primary/90">{l}</div>
      ))}
      {lineIdx < lines.length && (
        <div className="text-primary">
          {current}
          <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-blink align-middle" />
        </div>
      )}
    </div>
  );
}
