import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Clock,
  Calendar,
  BookOpen,
  ArrowRight,
  MessageSquareHeart,
} from "lucide-react";
import { BLOG_POSTS, BlogPost, StoryCategory } from "@/data/blogData";
import { BOOK_INFO } from "@/data/bookData";
import StoryInteractions from "@/components/StoryInteractions";
import ThemeToggle from "@/components/ThemeToggle";
import { getGoApiBaseUrl } from "@/lib/goApi";

export const instant = false;

async function fetchStory(slug: string): Promise<BlogPost | null> {
  // 1. Try fetching from Go Backend (PostgreSQL single source of truth)
  try {
    const baseUrl = getGoApiBaseUrl();
    const res = await fetch(`${baseUrl}/stories/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.ok && data.story) {
        const s = data.story;
        const paragraphs =
          Array.isArray(s.content) && s.content.length > 0
            ? s.content
            : String(s.rawContent || "")
                .split("\n")
                .map((p: string) => p.trim())
                .filter(Boolean);

        return {
          id: s.id,
          slug: s.slug,
          title: s.title,
          excerpt: s.excerpt || paragraphs[0] || "",
          category: (s.category || "না বলা কথা") as StoryCategory,
          readTimeBn: s.readTimeBn || "৩ মিনিট পাঠ",
          dateBn: s.dateBn || "আজ",
          author: s.author || "নাম প্রকাশে অনিচ্ছুক",
          isAnonymous: Boolean(s.isAnonymous),
          isAdminPost: Boolean(s.isAdminPost),
          confessionIdBn: s.confessionIdBn,
          imageUrl: s.imageUrl || undefined,
          adminNote: s.adminNote || undefined,
          viewsCount: s.viewsCount || 1,
          likesCount: s.likesCount || 0,
          reactions: s.reactions || { love: 0, touched: 0, relatable: 0 },
          featured: Boolean(s.featured),
          content: paragraphs.length > 0 ? paragraphs : [s.rawContent || ""],
        };
      }
    }
  } catch (err) {
    console.warn("Go Backend fetchStory error:", err);
  }

  // 2. Fallback to hardcoded editorial BLOG_POSTS
  const fallback = BLOG_POSTS.find((p) => p.slug === slug);
  return fallback || null;
}

async function fetchRelatedStories(currentSlug: string): Promise<BlogPost[]> {
  try {
    const baseUrl = getGoApiBaseUrl();
    const res = await fetch(`${baseUrl}/stories?limit=6`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.ok && Array.isArray(data.stories)) {
        const filtered = data.stories
          .filter((s: { slug: string }) => s.slug !== currentSlug)
          .slice(0, 2);
        if (filtered.length > 0) {
          return filtered;
        }
      }
    }
  } catch {
    // ignore
  }

  return BLOG_POSTS.filter((p) => p.slug !== currentSlug).slice(0, 2);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchStory(slug);
  if (!post) {
    return {
      title: "লেখাটি খুঁজে পাওয়া যায়নি | অনুভূতি",
    };
  }

  return {
    title: `${post.title} | অনুভূতি`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.imageUrl ? [{ url: post.imageUrl }] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchStory(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await fetchRelatedStories(slug);

  return (
    <div className="min-h-screen bg-[#FDF8F2] dark:bg-[#0B0F17] text-[#142230] dark:text-[#E2E8F0] transition-colors duration-200">
      {/* Minimal Light/Dark Header with Navigation Menu */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-[#111827]/95 border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Onuvuti-Publications-Logo.png"
                alt="Onuvuti Publications"
                className="h-11 sm:h-12 w-auto object-contain mix-blend-multiply dark:mix-blend-normal dark:bg-white/10 dark:p-1 dark:rounded-xl"
              />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-stone-500 hover:text-[#80131E] dark:text-stone-400 dark:hover:text-rose-400 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>হোমপেজ</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-2 text-xs font-extrabold text-stone-600 dark:text-stone-300">
            <Link
              href="/?category=ক্রাশ ও কনফেশন"
              className="px-3 py-1.5 rounded-xl hover:bg-[#FAF4E6] dark:hover:bg-stone-800 hover:text-[#80131E] dark:hover:text-rose-400 transition"
            >
              ক্রাশ ও কনফেশন
            </Link>
            <Link
              href="/?category=রোমান্টিক গল্প"
              className="px-3 py-1.5 rounded-xl hover:bg-[#FAF4E6] dark:hover:bg-stone-800 hover:text-[#80131E] dark:hover:text-rose-400 transition"
            >
              রোমান্টিক গল্প
            </Link>
            <Link
              href="/?category=না বলা কথা"
              className="px-3 py-1.5 rounded-xl hover:bg-[#FAF4E6] dark:hover:bg-stone-800 hover:text-[#80131E] dark:hover:text-rose-400 transition"
            >
              না বলা কথা
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Link
              href="/sporsher-byakoron"
              className="px-3.5 py-2 rounded-xl bg-[#80131E] text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-[#630d16] transition shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>‘স্পর্শের ব্যাকরণ’ • ৳{BOOK_INFO.offerPriceBn}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        <div className="space-y-3 pb-6 border-b border-stone-200 dark:border-stone-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#FAF4E6] dark:bg-[#1E293B] border border-[#C59B27]/40 dark:border-[#C59B27]/30 text-[#80131E] dark:text-rose-300 text-xs font-bold">
              {post.category}
            </span>

            {post.confessionIdBn && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-[#80131E] dark:text-rose-300 text-xs font-extrabold border border-rose-200 dark:border-rose-900/60">
                {post.confessionIdBn}
              </span>
            )}

            {post.isAdminPost && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-extrabold border border-amber-200 dark:border-amber-900/60">
                সম্পাদকের কলমে
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#142230] dark:text-white leading-snug">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 dark:text-stone-400 pt-1">
            <span className="font-bold text-stone-700 dark:text-stone-300">লেখক: {post.author}</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#80131E] dark:text-rose-400" />
              {post.dateBn}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#80131E] dark:text-rose-400" />
              {post.readTimeBn}
            </span>
          </div>
        </div>

        {/* ONLY render image if writer or admin explicitly added one */}
        {post.imageUrl && (
          <div className="rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#111827] shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full max-h-96 object-cover"
            />
          </div>
        )}

        <article className="space-y-5 text-base sm:text-lg text-stone-800 dark:text-stone-200 leading-relaxed bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          {post.content.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        {/* Admin Advice / Editorial Reply Box ("অনুভূতি টিমের পরামর্শ / উত্তর") */}
        {post.adminNote && (
          <div className="rounded-3xl bg-[#FAF4E6] dark:bg-[#1A2234] border-2 border-[#C59B27]/50 dark:border-[#C59B27]/40 p-6 sm:p-7 space-y-2.5 shadow-xs">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#80131E] dark:text-rose-400">
              <MessageSquareHeart className="w-4 h-4 text-[#80131E] dark:text-rose-400" />
              <span>অনুভূতি টিমের পরামর্শ ও সহমর্মিতা</span>
            </div>
            <p className="text-sm sm:text-base text-[#142230] dark:text-stone-200 leading-relaxed font-medium">
              {post.adminNote}
            </p>
          </div>
        )}

        {/* Emotional Reactions, 1-Click Story Card Download, Share Buttons & Comments Box */}
        <StoryInteractions
          storyId={post.id}
          storyTitle={post.title}
          storyExcerpt={post.excerpt}
          storyCategory={post.category}
          storyAuthor={post.author}
          confessionIdBn={post.confessionIdBn}
          initialLikes={post.likesCount}
          initialReactions={post.reactions}
        />

        {/* Minimal Book Callout at End of Article */}
        <div className="rounded-2xl bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/45 dark:border-[#C59B27]/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="text-xs text-[#80131E] dark:text-rose-400 font-bold">
              অনুভূতি পাবলিকেশন্সের ই-বুক
            </div>
            <h3 className="text-lg font-extrabold text-[#142230] dark:text-white">
              {BOOK_INFO.titleBn}: {BOOK_INFO.subtitleBn}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              রেগুলার মূল্য <span className="line-through">৳{BOOK_INFO.regularPriceBn}</span> •{" "}
              <strong>{BOOK_INFO.discountPercentBn}ে মাত্র ৳{BOOK_INFO.offerPriceBn}</strong>
            </p>
          </div>

          <Link
            href="/sporsher-byakoron"
            className="px-5 py-2.5 rounded-xl bg-[#80131E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shrink-0 hover:bg-[#630d16] transition shadow-xs"
          >
            <span>বইটি দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related Stories */}
        <div className="pt-4 space-y-4">
          <h3 className="text-lg font-extrabold text-[#142230] dark:text-white">
            আরও গল্প পড়ুন
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.id}
                href={`/blog/${rp.slug}`}
                className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 hover:border-[#80131E]/50 dark:hover:border-rose-500/50 transition space-y-1.5 shadow-xs"
              >
                <span className="text-[11px] font-bold text-[#80131E] dark:text-rose-400">
                  {rp.category}
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-[#142230] dark:text-white line-clamp-2">
                  {rp.title}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">— {rp.author}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
