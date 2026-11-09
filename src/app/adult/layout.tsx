import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onuvuti 18+ — After Hours Private Collection",
  description: "Age-restricted private media collection. Strictly 18+.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
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
