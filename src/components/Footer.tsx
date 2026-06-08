import logoAsset from "@/assets/basnion-logo.png.asset.json";
import { Instagram, Linkedin, Github, Mail, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="relative border-t border-primary/20 mt-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={logoAsset.url} alt="Basnion" className="h-12 w-12" />
            <div>
              <div className="font-display font-bold text-xl tracking-widest">BASNION</div>
              <div className="text-xs font-mono text-primary/70">Harbas Onion CTF</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-mono leading-relaxed">
            &gt; from_curiosity to cybersecurity<br />
            &gt; smk harapan bangsa
          </p>
        </div>

        <div>
          <h4 className="font-mono text-sm text-primary mb-4">// contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2 text-muted-foreground hover:text-primary transition">
              <Mail size={16} className="text-primary" />
              <a href="mailto:basnion@smkharapanbangsa.id" className="font-mono">basnion@smkharapanbangsa.id</a>
            </li>
            <li className="flex items-center gap-2 text-muted-foreground hover:text-primary transition">
              <Globe size={16} className="text-primary" />
              <a href="https://basnion.my.id" target="_blank" rel="noreferrer" className="font-mono">basnion.my.id</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-sm text-primary mb-4">// socials</h4>
          <ul className="flex flex-wrap gap-3">
            {[
              { icon: Instagram, label: "Instagram", href: "https://instagram.com/Basnion" },
              { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/harbas-onion" },
              { icon: Github, label: "GitHub", href: "https://github.com/basnion" },
            ].map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid place-items-center h-11 w-11 rounded-md neon-border hover:neon-glow hover:scale-110 transition-all"
                >
                  <Icon size={18} className="text-primary" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary/10 py-6 text-center text-xs font-mono text-muted-foreground">
        © {new Date().getFullYear()} BASNION · Harbas Onion CTF Community · SMK Harapan Bangsa
      </div>
    </footer>
  );
}
