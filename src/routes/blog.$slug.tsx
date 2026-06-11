import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSignedUrl } from "@/lib/storage";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", params.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.title} — Basnion Blog` },
      { name: "description", content: loaderData.excerpt ?? loaderData.title },
      { property: "og:title", content: loaderData.title },
      { property: "og:description", content: loaderData.excerpt ?? "" },
      ...(loaderData.cover_image_url ? [{ property: "og:image", content: loaderData.cover_image_url }] : []),
    ] : [],
  }),
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center text-center px-4">
      <div>
        <h1 className="text-2xl font-display font-bold">Gagal memuat post</h1>
        <p className="text-sm text-muted-foreground mt-2 font-mono">{error.message}</p>
        <Link to="/blog" className="inline-block mt-4 text-primary font-mono text-sm">← back to blog</Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center text-center px-4">
      <div>
        <h1 className="text-3xl font-display font-bold neon-text">404</h1>
        <p className="text-sm text-muted-foreground mt-2 font-mono">&gt; post tidak ditemukan</p>
        <Link to="/blog" className="inline-block mt-4 text-primary font-mono text-sm">← back to blog</Link>
      </div>
    </div>
  ),
  component: BlogPost,
});

function BlogPost() {
  const post = Route.useLoaderData();
  const { data: pdfUrl, isLoading: pdfLoading } = useSignedUrl("blog", post.pdf_path);

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />
      <article className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-1 text-primary font-mono text-xs hover:text-primary/80 mb-6">
            <ArrowLeft size={12} /> ./blog
          </Link>

          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl leading-tight">{post.title}</h1>
          {post.published_at && (
            <p className="font-mono text-xs text-muted-foreground mt-3">
              {new Date(post.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
          {post.excerpt && <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>}

          {post.cover_image_url && (
            <div className="mt-8 rounded-xl overflow-hidden neon-border">
              <img src={post.cover_image_url} alt={post.title} className="w-full" />
            </div>
          )}

          {post.content_html && (
            <div
              className="prose prose-invert max-w-none mt-10 font-mono prose-headings:font-display prose-headings:text-foreground prose-a:text-primary prose-code:text-primary prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: post.content_html }}
            />
          )}

          {post.pdf_path && (
            <div className="mt-10 glass-card rounded-xl p-5 neon-border">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="text-primary" size={20} />
                <div className="min-w-0">
                  <h3 className="font-display font-bold">PDF Attachment</h3>
                  <p className="text-xs font-mono text-muted-foreground">&gt; embedded viewer</p>
                </div>
                {pdfUrl && (
                  <a href={pdfUrl} target="_blank" rel="noreferrer" className="ml-auto px-3 py-1.5 rounded-md border border-primary/30 text-primary font-mono text-xs hover:bg-primary/10">
                    open in new tab
                  </a>
                )}
              </div>
              {pdfLoading ? (
                <div className="aspect-[4/5] grid place-items-center"><Loader2 className="animate-spin text-primary" /></div>
              ) : pdfUrl ? (
                <iframe src={pdfUrl} title={post.title} className="w-full aspect-[4/5] rounded-md bg-background border border-primary/20" />
              ) : (
                <p className="text-sm text-destructive font-mono">&gt; gagal memuat PDF</p>
              )}
            </div>
          )}
        </div>
      </article>
      <Footer />
    </div>
  );
}
