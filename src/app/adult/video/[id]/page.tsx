import { Suspense } from "react";
import AdultVideoClient from "./AdultVideoClient";

async function AdultVideoPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdultVideoClient id={id} />;
}

export default function AdultVideoPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<main className="adult-shell adult-detail-loading"><span className="adult-spinner" aria-label="Loading video" /></main>}><AdultVideoPageContent params={params} /></Suspense>;
}
