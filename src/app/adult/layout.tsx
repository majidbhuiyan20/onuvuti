import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onuvuti 18+ — After Hours Private Collection",
  description: "Age-restricted private media collection. Strictly 18+.",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  other: { rating: "adult" },
};

export default function AdultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="adult-layout min-h-screen">
      {children}
    </div>
  );
}
