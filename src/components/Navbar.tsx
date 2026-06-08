import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/basnion-logo.png.asset.json";
import { useEffect, useState } from "react";

const sections = [
  { id: "about", label: "About" },
  { id: "vision", label: "Vision" },
  { id: "philosophy", label: "Philosophy" },
  { id: "programs", label: "Programs" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-primary/20" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logoAsset.url} alt="Basnion" className="h-10 w-10 group-hover:drop-shadow-[0_0_8px_oklch(0.85_0.25_145)] transition" />
          <span className="font-display font-bold tracking-widest text-lg hidden sm:inline">BASNION</span>
        </Link>
        <ul className="hidden md:flex items-center gap-1">
          {sections.map(s => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="px-3 py-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors relative group"
              >
                <span className="text-primary/60">./</span>{s.label.toLowerCase()}
                <span className="absolute bottom-0 left-3 right-3 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </a>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="menu"
          className="md:hidden p-2 text-primary"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </nav>
      {open && (
        <div className="md:hidden border-t border-primary/20 bg-background/95 backdrop-blur-xl">
          <ul className="px-6 py-4 space-y-2">
            {sections.map(s => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setOpen(false)}
                  className="block py-2 font-mono text-sm text-muted-foreground hover:text-primary"
                >
                  <span className="text-primary/60">./</span>{s.label.toLowerCase()}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
