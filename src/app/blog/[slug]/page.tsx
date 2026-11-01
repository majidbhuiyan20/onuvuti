import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, BookOpen, ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "@/data/blogData";
import { BOOK_INFO } from "@/data/bookData";
import StoryInteractions from "@/components/StoryInteractions";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-[#FDF8F2] text-[#142230]">
      {/* Minimal Light Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 border-b border-stone-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Onuvuti-Publications-Logo.png"
                alt="Onuvuti Publications"
                className="h-11 sm:h-12 w-auto object-contain mix-blend-multiply"
              />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-stone-500 hover:text-[#80131E] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>সকল গল্প</span>
            </Link>
          </div>

          <Link
            href="/sporsher-byakoron"
            className="px-3.5 py-1.5 rounded-xl bg-[#80131E] text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-[#630d16] transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>‘স্পর্শের ব্যাকরণ’ • ৳{BOOK_INFO.offerPriceBn}</span>
          </Link>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        <div className="space-y-3 pb-6 border-b border-stone-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#FAF4E6] border border-[#C59B27]/40 text-[#80131E] text-xs font-bold">
              {post.category === "ক্রাশ ও কনফেশন"
                ? "💘 ক্রাশ ও কনফেশন"
                : post.category === "না বলা কথা"
                ? "💌 না বলা কথা"
                : post.category}
            </span>

            {post.confessionIdBn && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-[#80131E] text-xs font-extrabold">
                {post.confessionIdBn}
              </span>
            )}

            {post.isAdminPost && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold">
                ✍️ সম্পাদকের কলমে
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#142230] leading-snug">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-1">
            <span className="font-bold text-stone-700">লেখক: {post.author}</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#80131E]" />
              {post.dateBn}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#80131E]" />
              {post.readTimeBn}
            </span>
          </div>
        </div>

        {/* ONLY render image if writer or admin explicitly added one */}
        {post.imageUrl && (
          <div className="rounded-3xl overflow-hidden border border-stone-200 bg-white shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full max-h-96 object-cover"
            />
          </div>
        )}

        <article className="space-y-5 text-base sm:text-lg text-stone-800 leading-relaxed bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
          {post.content.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        {/* Emotional Reactions, Share Buttons & Comments Box */}
        <StoryInteractions
          storyId={post.id}
          storyTitle={post.title}
          initialLikes={post.likesCount}
          initialReactions={post.reactions}
        />

        {/* Minimal Book Callout at End of Article */}
        <div className="rounded-2xl bg-[#FAF4E6] border border-[#C59B27]/45 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="text-xs text-[#80131E] font-bold">
              অনুভূতি পাবলিকেশন্সের ই-বুক
            </div>
            <h3 className="text-lg font-extrabold text-[#142230]">
              {BOOK_INFO.titleBn}: {BOOK_INFO.subtitleBn}
            </h3>
            <p className="text-xs text-stone-600">
              রেগুলার মূল্য <span className="line-through">৳{BOOK_INFO.regularPriceBn}</span> •{" "}
              <strong>{BOOK_INFO.discountPercentBn}ে মাত্র ৳{BOOK_INFO.offerPriceBn}</strong>
            </p>
          </div>

          <Link
            href="/sporsher-byakoron"
            className="px-5 py-2.5 rounded-xl bg-[#80131E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shrink-0 hover:bg-[#630d16] transition"
          >
            <span>বইটি দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related Stories */}
        <div className="pt-4 space-y-4">
          <h3 className="text-lg font-extrabold text-[#142230]">
            আরও গল্প পড়ুন
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.id}
                href={`/blog/${rp.slug}`}
                className="rounded-2xl bg-white border border-stone-200 p-4 hover:border-[#80131E]/50 transition space-y-1.5"
              >
                <span className="text-[11px] font-bold text-[#80131E]">
                  {rp.category}
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-[#142230] line-clamp-2">
                  {rp.title}
                </h4>
                <p className="text-xs text-stone-500">— {rp.author}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
