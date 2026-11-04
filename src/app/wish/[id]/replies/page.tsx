import React from "react";
import type { Metadata } from "next";
import RepliesView from "@/features/wish/components/RepliesView";

export const instant = false;

export const metadata: Metadata = {
  title: "রিঅ্যাকশন দেখুন | অনুভূতি",
  robots: { index: false, follow: false },
};

export default async function WishRepliesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { id } = await params;
  const { key } = await searchParams;
  return <RepliesView id={id} manageKey={key ?? ""} />;
}

