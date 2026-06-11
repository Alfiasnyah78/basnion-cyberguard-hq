import { BrandLogo } from "@/components/BrandLogo";
import { Instagram, Linkedin, Github, Twitter, Youtube, Mail, Globe } from "lucide-react";
import { useSiteContent, type SocialLink } from "@/lib/site-content";

const ICONS: Record<SocialLink["icon"], typeof Instagram> = {
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  youtube: Youtube,
  globe: Globe,
  mail: Mail,
};

export function Footer() {
  const c = useSiteContent().footer;
  return (
    <footer id="contact" className="relative border-t border-primary/20 mt-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <BrandLogo className="h-12 w-12" />
            <div>
              <div className="font-display font-bold text-xl tracking-widest">BASNION</div>
              <div className="text-xs font-mono text-primary/70">Harbas Onion CTF</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-mono leading-relaxed">
            &gt; {c.tagline_line1}<br />
            &gt; {c.tagline_line2}
          </p>
        </div>

        <div>
          <h4 className="font-mono text-sm text-primary mb-4">// contact</h4>
          <ul className="space-y-3 text-sm">
            {c.email && (
              <li className="flex items-center gap-2 text-muted-foreground hover:text-primary transition">
                <Mail size={16} className="text-primary" />
                <a href={`mailto:${c.email}`} className="font-mono">{c.email}</a>
              </li>
            )}
            {c.website && (
              <li className="flex items-center gap-2 text-muted-foreground hover:text-primary transition">
                <Globe size={16} className="text-primary" />
                <a href={c.website.startsWith("http") ? c.website : `https://${c.website}`} target="_blank" rel="noreferrer" className="font-mono">
                  {c.website.replace(/^https?:\/\//, "")}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-sm text-primary mb-4">// socials</h4>
          <ul className="flex flex-wrap gap-3">
            {c.socials.map((s) => {
              const Icon = ICONS[s.icon] ?? Globe;
              return (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="grid place-items-center h-11 w-11 rounded-md neon-border hover:neon-glow hover:scale-110 transition-all"
                  >
                    <Icon size={18} className="text-primary" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary/10 py-6 text-center text-xs font-mono text-muted-foreground">
        © {new Date().getFullYear()} {c.copyright_suffix}
      </div>
    </footer>
  );
}
