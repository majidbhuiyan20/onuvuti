export interface OccasionDetails {
  isWedding: boolean;
  isAnniversary: boolean;
  isLove: boolean;
  isBirthday: boolean;
  isProposal: boolean;
  occasionType: "wedding" | "anniversary" | "love" | "birthday";
  headerTitle: string;
  badgeTitle: string;
  repliesTitle: string;
  repliesSubtitle: string;
  backLinkLabel: string;
  emptyStateTitle: string;
  emptyStateDesc: string;
  ctaTitle: string;
  ctaSubtitle: string;
}

export function detectOccasion(
  wish?: { theme?: string; relationship?: string; recipientName?: string; senderName?: string } | null,
  message?: string
): OccasionDetails {
  const rel = wish?.relationship || "";
  const th = wish?.theme || "";
  const msg = message || "";

  const isWedding =
    th === "wedding_royal" ||
    rel.includes("বিবাহ") ||
    rel.includes("নিমন্ত্রণ") ||
    rel.includes("বর-কনে") ||
    msg.includes("শুভ বিবাহ") ||
    msg.includes("পাত্র:");

  const isAnniversary =
    !isWedding &&
    (th === "anniversary_gold" ||
      rel.includes("বার্ষিকী") ||
      rel.includes("দম্পতি") ||
      msg.includes("বিবাহবার্ষিকী"));

  const isProposal =
    !isWedding &&
    !isAnniversary &&
    (rel.includes("প্রস্তাব") || msg.includes("প্রস্তাব"));

  const isLove =
    !isWedding &&
    !isAnniversary &&
    (isProposal ||
      th === "rose" ||
      rel.includes("ভালোবাসা") ||
      rel.includes("ক্রাশ") ||
      rel.includes("মনের মানুষ") ||
      rel.includes("না বলা কথা") ||
      msg.includes("ভালোবাসি"));

  const isBirthday = !isWedding && !isAnniversary && !isLove;

  let occasionType: "wedding" | "anniversary" | "love" | "birthday" = "birthday";
  if (isWedding) occasionType = "wedding";
  else if (isAnniversary) occasionType = "anniversary";
  else if (isLove) occasionType = "love";

  const recipient = wish?.recipientName || "প্রিয়জন";

  const headerTitle = isWedding
    ? "শুভ বিবাহ নিমন্ত্রণপত্র"
    : isAnniversary
    ? "শুভ বিবাহবার্ষিকী"
    : isLove
    ? isProposal
      ? "ভালোবাসার প্রস্তাব ও অনুভূতি"
      : "এক টুকরো গোপন অনুভূতি"
    : "শুভ জন্মদিন";

  const badgeTitle = isWedding
    ? "শুভ বিবাহ নিমন্ত্রণ ও মেহমান ট্র্যাকার"
    : isAnniversary
    ? "বিবাহবার্ষিকীর শুভেচ্ছা ও আশীর্বাদ ট্র্যাকার"
    : isLove
    ? isProposal
      ? "প্রেমের প্রস্তাব ও প্রত্যুত্তর ট্র্যাকার"
      : "ভালোবাসার চিঠি ও অনুভূতি ট্র্যাকার"
    : "জন্মদিনের শুভেচ্ছা ও রিঅ্যাকশন ট্র্যাকার";

  const repliesTitle = isWedding
    ? `${recipient}-এর জন্য শুভ বিবাহ নিমন্ত্রণপত্র`
    : isAnniversary
    ? `${recipient}-এর জন্য বিবাহবার্ষিকীর চিঠি`
    : isLove
    ? isProposal
      ? `${recipient}-এর জন্য প্রেমের প্রস্তাব`
      : `${recipient}-এর জন্য ভালোবাসার চিঠি`
    : `${recipient}-এর জন্য জন্মদিনের চিঠি`;

  const repliesSubtitle = isWedding
    ? "আমন্ত্রিত মেহমানদের উপস্থিতি ও আশীর্বাদ"
    : isAnniversary
    ? "বিবাহবার্ষিকীর পাঠানো শুভেচ্ছা ও শুভকামনা"
    : isLove
    ? "মনের মানুষের পাঠানো অনুভূতি ও প্রত্যুত্তর"
    : "প্রিয়জনের পাঠানো মিষ্টি বার্তা ও রিঅ্যাকশন";

  const backLinkLabel = isWedding
    ? "← নিমন্ত্রণপত্র তৈরি পেজ"
    : isAnniversary
    ? "← বিবাহবার্ষিকী চিঠি তৈরি পেজ"
    : isLove
    ? "← ভালোবাসার চিঠি তৈরি পেজ"
    : "← জন্মদিনের চিঠি তৈরি পেজ";

  const emptyStateTitle = isWedding
    ? "এখনো কোনো মেহমান উপস্থিতি নিশ্চিত করেননি"
    : isAnniversary
    ? "এখনো কোনো শুভেচ্ছা বার্তা আসেনি"
    : isLove
    ? "এখনো কোনো প্রত্যুত্তর আসেনি"
    : "এখনো কোনো রিঅ্যাকশন আসেনি";

  const emptyStateDesc = isWedding
    ? "আমন্ত্রিত মেহমানরা নিমন্ত্রণপত্র খুলে তাদের উপস্থিতি নিশ্চিত করলে এখানে বিস্তারিত তালিকা দেখা যাবে।"
    : isAnniversary
    ? "প্রাপক চিঠি খুলে শুভেচ্ছা জানালে বা আশীর্বাদ বার্তা পাঠালে এখানে তা সংরক্ষিত হবে।"
    : isLove
    ? "প্রিয় মানুষ চিঠিটি খুলে ভালোবাসার অনুভূতি গ্রহণ করলে বা প্রত্যুত্তর দিলে তা এখানে সংরক্ষিত হবে।"
    : "প্রাপক চিঠি খুলে রিঅ্যাকশন বা বার্তা পাঠালে এখানে তা সংরক্ষিত হবে।";

  const ctaTitle = isWedding
    ? "আপনিও কি প্রিয়জন ও মেহমানদের জন্য এমন রাজকীয় বিয়ের নিমন্ত্রণপত্র তৈরি করতে চান?"
    : isAnniversary
    ? "আপনিও কি জীবনসঙ্গীর জন্য এমন ভালোবাসার বিবাহবার্ষিকীর চিঠি পাঠাতে চান?"
    : isLove
    ? isProposal
      ? "আপনিও কি মনের মানুষের জন্য এমন মিষ্টি প্রেমের প্রস্তাব পাঠাতে চান?"
      : "আপনিও কি প্রিয় মানুষের জন্য এমন মিষ্টি প্রেমের চিঠি পাঠাতে চান?"
    : "আপনিও কি প্রিয়জনকে এমন জন্মদিনের জাদুকরী চিঠি পাঠাতে চান?";

  const ctaSubtitle = isWedding
    ? "খুব সহজেই তৈরি করুন এমন সুন্দর ডিজিটাল বিয়ের কার্ড ও খাম—১ ক্লিকে লিঙ্ক পাঠিয়ে মেহমানদের দাওয়াত দিন!"
    : isAnniversary
    ? "খুব সহজেই তৈরি করুন এমন ভালোবাসার খাম ও চিঠি—১ ক্লিকে লিঙ্ক পাঠিয়ে জীবনসঙ্গীকে চমকে দিন!"
    : isLove
    ? "খুব সহজেই মনের না-বলা কথা সাজিয়ে তৈরি করুন আবেগভরা চিঠি ও গোপন খাম—১ ক্লিকে লিঙ্ক পাঠিয়ে চমকে দিন প্রিয়জনকে!"
    : "খুব সহজেই তৈরি করুন এমন সুন্দর জাদুকরী খাম ও আবেগভরা চিঠি—১ ক্লিকে লিঙ্ক পাঠিয়ে চমকে দিন প্রিয়জনকে!";

  return {
    isWedding,
    isAnniversary,
    isLove,
    isBirthday,
    isProposal,
    occasionType,
    headerTitle,
    badgeTitle,
    repliesTitle,
    repliesSubtitle,
    backLinkLabel,
    emptyStateTitle,
    emptyStateDesc,
    ctaTitle,
    ctaSubtitle,
  };
}
