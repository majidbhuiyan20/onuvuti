import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug, CATEGORIES_DATA } from "@/data/categoryData";
import CategoryStoriesClient from "./CategoryStoriesClient";

export const instant = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CATEGORIES_DATA.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "ক্যাটাগরি পাওয়া যায়নি | অনুভূতি",
    };
  }

  return {
    title: `${category.nameBn} — অনুভূতি পাবলিকেশন্স`,
    description: category.descriptionBn,
    keywords: [
      category.nameBn,
      "অনুভূতি গল্প",
      "বাংলা গল্প",
      "কনফেশন",
      "সম্পর্ক",
      "অনভূতি পাবলিকেশন্স",
    ],
    openGraph: {
      title: `${category.nameBn} | অনুভূতি`,
      description: category.taglineBn,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return <CategoryStoriesClient category={category} />;
}
