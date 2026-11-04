import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WishViewer from "@/features/wish/components/WishViewer";
import type { WishPublic } from "@/features/wish/types";
import { getGoApiBaseUrl } from "@/lib/goApi";

export const instant = false;

/** Public metadata only: no content, and fetching it never counts as a "view". */
async function fetchWish(id: string): Promise<WishPublic | null> {
  try {
    const res = await fetch(`${getGoApiBaseUrl()}/wishes/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.ok && data.wish) return data.wish as WishPublic;
    }
  } catch (err) {
    console.error("Failed to fetch wish from Go backend:", err);
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const wish = await fetchWish(id);

  if (!wish) {
    return {
      title: "একটি বিশেষ জন্মদিনের চিঠি | অনুভূতি",
      description: "প্রিয় মানুষের জন্য পাঠানো একটি সুন্দর জাদুকরী চিঠি।",
    };
  }

  return {
    title: `🎂 প্রিয় ${wish.recipientName}, তোমার জন্য একটি বিশেষ চিঠি এসেছে! | অনুভূতি`,
    description: `${wish.senderName} তোমার জন্য অনুভূতির পাতায় একটি জাদুকরী খামে মোড়ানো জন্মদিনের চিঠি পাঠিয়েছে। খামটি খুলতে ট্যাপ করো...`,
    openGraph: {
      title: `🎂 প্রিয় ${wish.recipientName}, তোমার জন্য একটি বিশেষ চিঠি এসেছে!`,
      description: `${wish.senderName} তোমার জন্য একটি উপহার পাঠিয়েছে। খামটি খুলে দেখতে ট্যাপ করো...`,
      type: "website",
    },
  };
}

export default async function WishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wish = await fetchWish(id);

  if (!wish) {
    return notFound();
  }

  return <WishViewer initialWish={wish} />;
}
