import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, BookOpen, ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "@/data/blogData";
import { BOOK_INFO } from "@/data/bookData";

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
              <span>ব্লগ</span>
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="space-y-3 pb-6 border-b border-stone-200">
          <span className="inline-block px-3 py-0.5 rounded-full bg-[#FAF4E6] border border-[#C59B27]/40 text-[#80131E] text-xs font-bold">
            {post.category}
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#142230] leading-snug">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-1">
            <span>লেখক: {post.author}</span>
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

        <article className="py-8 space-y-5 text-base sm:text-lg text-stone-800 leading-relaxed">
          {post.content.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        {/* Minimal Book Callout at End of Article */}
        <div className="mt-6 rounded-2xl bg-white border border-stone-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="text-xs text-[#80131E] font-bold">
              অনুভূতি পাবলিকেশন্সের ই-বুক
            </div>
            <h3 className="text-lg font-extrabold text-[#142230]">
              {BOOK_INFO.titleBn}: {BOOK_INFO.subtitleBn}
            </h3>
            <p className="text-xs text-stone-600">
              মূল্য মাত্র ৳{BOOK_INFO.offerPriceBn} • ইনস্ট্যান্ট PDF ডাউনলোড
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
      </main>
    </div>
  );
}
