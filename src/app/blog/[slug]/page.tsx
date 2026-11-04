import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BLOG_POSTS, BlogPost, StoryCategory } from "@/data/blogData";
import { CommentItem } from "@/components/StoryInteractions";
import SidebarBanners from "@/components/SidebarBanners";
import StoryReaderView from "@/components/story/StoryReaderView";
import { getGoApiBaseUrl } from "@/lib/goApi";

export const instant = false;

interface StoryFetchResult {
  post: BlogPost;
  comments: CommentItem[];
}

async function fetchStory(slug: string): Promise<StoryFetchResult | null> {
  // 1. Try fetching from Go Backend (PostgreSQL single source of truth)
  try {
    const baseUrl = getGoApiBaseUrl();
    const res = await fetch(`${baseUrl}/stories/${encodeURIComponent(slug)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
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
          post: {
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
          },
          comments: Array.isArray(data.comments) ? data.comments : [],
        };
      }
    }
  } catch (err) {
    console.warn("Go Backend fetchStory error:", err);
  }

  // 2. Fallback to hardcoded editorial BLOG_POSTS
  const fallback = BLOG_POSTS.find((p) => p.slug === slug);
  if (fallback) {
    return { post: fallback, comments: [] };
  }
  return null;
}

async function fetchRelatedStories(currentSlug: string): Promise<BlogPost[]> {
  try {
    const baseUrl = getGoApiBaseUrl();
    const res = await fetch(`${baseUrl}/stories?limit=6`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
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

async function fetchAdjacentStories(
  currentSlug: string
): Promise<{ prev: BlogPost | null; next: BlogPost | null }> {
  try {
    const baseUrl = getGoApiBaseUrl();
    const res = await fetch(`${baseUrl}/stories?limit=100`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.ok && Array.isArray(data.stories)) {
        const stories: BlogPost[] = data.stories;
        const index = stories.findIndex((s) => s.slug === currentSlug);
        if (index !== -1) {
          return {
            prev: index > 0 ? stories[index - 1] : null,
            next: index < stories.length - 1 ? stories[index + 1] : null,
          };
        }
      }
    }
  } catch {
    // ignore
  }

  const fallbackIdx = BLOG_POSTS.findIndex((p) => p.slug === currentSlug);
  if (fallbackIdx !== -1) {
    return {
      prev: fallbackIdx > 0 ? BLOG_POSTS[fallbackIdx - 1] : null,
      next: fallbackIdx < BLOG_POSTS.length - 1 ? BLOG_POSTS[fallbackIdx + 1] : null,
    };
  }
  return { prev: null, next: null };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const result = await fetchStory(slug);
    if (!result || !result.post) {
      return {
        title: "লেখাটি খুঁজে পাওয়া যায়নি | অনুভূতি",
      };
    }
    const post = result.post;

    return {
      title: `${post.title} | অনুভূতি`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: post.imageUrl ? [{ url: post.imageUrl }] : [],
      },
    };
  } catch {
    return {
      title: "অনুভূতি — মনের না বলা কথা",
    };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await fetchStory(slug);

  if (!result || !result.post) {
    notFound();
  }

  const { post, comments } = result;
  const relatedPosts = await fetchRelatedStories(slug);
  const { prev: prevPost, next: nextPost } = await fetchAdjacentStories(slug);

  return (
    <>
      <SidebarBanners />
      <StoryReaderView
        post={post}
        comments={comments}
        relatedPosts={relatedPosts}
        prevPost={prevPost}
        nextPost={nextPost}
      />
    </>
  );
}
