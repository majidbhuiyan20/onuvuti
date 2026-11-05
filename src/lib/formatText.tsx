import React from "react";

/**
 * Strips basic markdown syntax (*, #, >, -) from plain text strings
 * Useful for excerpts, SEO descriptions, and button titles.
 */
export function stripMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/^[-*•]\s+/gm, "")
    .trim();
}

/**
 * Parses inline markdown:
 * - **bold text** -> <strong className="...">bold text</strong>
 * - ***bold italic*** -> <strong><em>...</em></strong>
 * - *italic text* -> <em className="...">italic text</em>
 */
export function renderFormattedInline(text: string): React.ReactNode {
  if (!text) return text;
  if (!text.includes("*")) return text;

  // Split on ***bold italic***, **bold**, or *italic*
  const tokens = text.split(/(\*\*\*[^*]+?\*\*\*|\*\*[^*]+?\*\*|\*[^*]+?\*)/g);

  return tokens.map((token, i) => {
    if (token.startsWith("***") && token.endsWith("***") && token.length >= 6) {
      return (
        <strong key={i} className="font-extrabold text-stone-900 dark:text-stone-100">
          <em className="italic">{token.slice(3, -3)}</em>
        </strong>
      );
    }
    if (token.startsWith("**") && token.endsWith("**") && token.length >= 4) {
      return (
        <strong key={i} className="font-extrabold text-stone-900 dark:text-stone-100">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("*") && token.endsWith("*") && token.length >= 2) {
      return (
        <em key={i} className="italic text-stone-800 dark:text-stone-200">
          {token.slice(1, -1)}
        </em>
      );
    }
    return token;
  });
}

/**
 * Formats a block / paragraph from a story or blog post,
 * handling headers, hr, blockquotes, bullet points, and bold section headers.
 */
export function renderStoryParagraph(paragraph: string, idx: number): React.ReactNode {
  const p = paragraph.trim();
  if (!p) return null;

  // Horizontal Rule (---, ***, ___, –-–)
  if (p === "---" || p === "***" || p === "___" || p === "–-–") {
    return <hr key={idx} className="my-6 border-t border-stone-200/90 dark:border-stone-800" />;
  }

  // Heading 1 (# Header)
  if (p.startsWith("# ")) {
    return (
      <h2
        key={idx}
        className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white pt-5 pb-1 border-b border-stone-200/70 dark:border-stone-800 leading-snug tracking-tight"
      >
        {renderFormattedInline(p.slice(2).trim())}
      </h2>
    );
  }

  // Heading 2 (## Header)
  if (p.startsWith("## ")) {
    return (
      <h3
        key={idx}
        className="text-lg sm:text-xl font-extrabold text-[#7E151E] dark:text-rose-400 pt-4 pb-0.5 leading-snug tracking-tight"
      >
        {renderFormattedInline(p.slice(3).trim())}
      </h3>
    );
  }

  // Heading 3 (### Header)
  if (p.startsWith("### ")) {
    return (
      <h4
        key={idx}
        className="text-base sm:text-lg font-bold text-stone-800 dark:text-stone-200 pt-3 pb-0.5 leading-snug"
      >
        {renderFormattedInline(p.slice(4).trim())}
      </h4>
    );
  }

  // Blockquote (> Quote)
  if (p.startsWith("> ")) {
    return (
      <blockquote
        key={idx}
        className="pl-4 py-2.5 border-l-4 border-[#7E151E] dark:border-rose-400 italic text-stone-700 dark:text-stone-300 bg-stone-100/60 dark:bg-stone-800/40 rounded-r-2xl my-3 text-justify sm:text-left"
      >
        {renderFormattedInline(p.slice(2).trim())}
      </blockquote>
    );
  }

  // List item (- Item, • Item, * Item)
  if (p.startsWith("- ") || p.startsWith("• ") || (p.startsWith("* ") && !p.endsWith("*"))) {
    return (
      <div key={idx} className="flex items-start gap-2.5 text-justify sm:text-left leading-relaxed pl-1 my-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#7E151E] dark:bg-rose-400 mt-2.5 shrink-0" />
        <span className="flex-1 font-normal">{renderFormattedInline(p.slice(2).trim())}</span>
      </div>
    );
  }

  // Entire line is bold: **Title / Subheading** (e.g. **Similarity — মিল বা সাদৃশ্য**)
  if (p.startsWith("**") && p.endsWith("**") && p.length >= 4) {
    return (
      <p
        key={idx}
        className="font-extrabold text-base sm:text-lg text-stone-900 dark:text-stone-100 pt-4 pb-0.5 leading-snug tracking-tight"
      >
        {p.slice(2, -2).trim()}
      </p>
    );
  }

  // Regular paragraph with inline formatting
  return (
    <p key={idx} className="font-normal text-justify sm:text-left leading-relaxed">
      {renderFormattedInline(p)}
    </p>
  );
}
