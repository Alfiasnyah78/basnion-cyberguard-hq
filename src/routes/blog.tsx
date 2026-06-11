import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowRight, FileText, Loader2 } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog & Write-ups — Basnion" },
      { name: "description", content: "Write-up CTF, riset keamanan, dan tutorial dari komunitas Basnion." },
      { property: "og:title", content: "Blog & Write-ups — Basnion" },
      { property: "og:description", content: "Write-up CTF, riset keamanan, dan tutorial dari komunitas Basnion." },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id,title,slug,excerpt,cover_image_url,pdf_path,published_at,created_at")
        .eq("published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neon-border text-xs font-mono text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-neon" />
            // blog --list
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl mt-4 mb-3">Write-ups & <span className="neon-text">Blog</span></h1>
          <p className="text-muted-foreground font-mono text-sm max-w-2xl">&gt; write-up CTF, riset, dan tutorial dari komunitas basnion</p>

          <div className="mt-10">
            {isLoading && <Loader2 className="animate-spin text-primary" />}
            {posts?.length === 0 && (
              <div className="glass-card rounded-xl p-12 text-center font-mono text-sm text-muted-foreground neon-border">
                &gt; belum ada post — soon...
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-5">
              {posts?.map(p => (
                <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="group glass-card rounded-xl overflow-hidden neon-border hover:-translate-y-1 transition-all flex flex-col">
                  {p.cover_image_url && (
                    <div className="aspect-video bg-input overflow-hidden">
                      <img src={p.cover_image_url} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-primary/70 mb-2">
                      {p.pdf_path && <span className="inline-flex items-center gap-1"><FileText size={11} /> PDF</span>}
                      {p.published_at && <span>{new Date(p.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>}
                    </div>
                    <h2 className="font-display font-bold text-xl group-hover:text-primary transition">{p.title}</h2>
                    {p.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{p.excerpt}</p>}
                    <div className="mt-auto pt-3 text-primary font-mono text-xs inline-flex items-center gap-1">
                      ./read <ArrowRight size={12} className="group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
