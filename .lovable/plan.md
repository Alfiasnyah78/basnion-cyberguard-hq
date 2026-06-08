## Basnion Website — Build Plan

### Design Direction
Futuristic cybersecurity theme matching the logo:
- **Palette**: Black background, neon green (#39FF14 / oklch ~0.85 0.25 145), accent purple from onion, silver/white text
- **Vibes**: Terminal/matrix feel, glowing borders, glitch effects, animated grid background, monospace + bold display fonts (JetBrains Mono + Space Grotesk/Orbitron)
- **Effects**: Animated terminal typing, glow shadows, scanline overlay, particles/matrix rain on hero, hover glitch on cards

### Pages / Routes
- `/` — Landing page (single scroll) with sections:
  - Hero: logo, tagline "From Curiosity to Cybersecurity", animated terminal CTA
  - About Basnion (filosofi nama HarBAS + ONION)
  - Visi & Misi
  - Filosofi Logo (grid of elements: onion, hoodie, laptop, lock, etc.)
  - Program Kerja (CTF Competitions, dynamic from DB)
  - Gallery (dynamic from DB)
  - Contact / Social links + footer
- `/Hosu35Hioasss` — Admin login page
- `/Hosu35Hioasss/dashboard` — Protected admin dashboard
  - Manage Gallery (add/delete images)
  - Manage Programs/Events
  - Manage Hero text / About content (site settings)

### Backend (Lovable Cloud)
- Enable Cloud (Supabase under the hood)
- Auth: email/password only (no signup UI — admin pre-seeded)
- Tables:
  - `gallery_items` (id, image_url, title, description, created_at)
  - `programs` (id, title, description, icon, date, created_at)
  - `site_settings` (key, value as jsonb) for editable hero/about copy
  - `user_roles` (id, user_id, role) + `has_role()` security definer for admin gating
- Storage bucket: `basnion-media` (public read, authenticated write)
- RLS: public SELECT on gallery/programs/settings, admin-only INSERT/UPDATE/DELETE
- Pre-seed admin user `jurikju31@harbas.onion.com` with the provided password and admin role via migration

### Assets
- Upload provided logo to Lovable Assets, use for favicon + nav + hero
- Replace default meta/og tags on every route with Basnion branding

### Technical
- TanStack Start routes under `src/routes/`
- Admin route uses `_authenticated` layout pattern + role check
- Server functions for admin mutations with `requireSupabaseAuth` + role verification
- Public reads via direct Supabase client (RLS-protected)

### Out of scope (confirm if you want these)
- Email sending, member registration flow, blog/articles, multi-language

Saya akan langsung build setelah ini di-approve.