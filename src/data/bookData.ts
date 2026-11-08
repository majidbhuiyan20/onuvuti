export interface ChapterItem {
  numberBn: string;
  numberEn: number;
  title: string;
}

export interface BookPart {
  id: string;
  partNumberBn: string;
  title: string;
  chapters: ChapterItem[];
}

export const BOOK_COVER_IMAGE = "/images/book-cover.png?v=20261108c";
export const BOOK_BACK_IMAGE = "/images/book-back.png?v=20261108c";

export const BOOK_INFO = {
  titleBn: "স্পর্শের ব্যাকরণ",
  subtitleBn: "ভালোবাসা, মনস্তত্ত্ব ও অন্তরঙ্গতার এক অনন্য পাঠ",
  taglineBn: "কেন কিছু স্পর্শ শব্দের চেয়েও গভীর?",
  descriptionBn:
    "ভালোবাসা শুধু একটি অনুভূতি নয়, এটি এক গভীর মনস্তাত্ত্বিক, স্নায়বিক ও শারীরিক সংযোগের শিল্প। আধুনিক জীবনের ব্যস্ততা, চাপ ও দূরত্বের ভেতরও কীভাবে স্পর্শ, বোঝাপড়া ও আবেগের মাধ্যমে সম্পর্ককে আরও গভীর, নিরাপদ ও দীর্ঘস্থায়ী করা যায়—এই বইটি তারই একটি বিজ্ঞানসম্মত ও হৃদয়স্পর্শী দিশা।",
  publisherBn: "সর্বস্বত্ব সংরক্ষিত",
  authorTeamBn: "গবেষণা ও সম্পাদকীয় টিম",
  departmentBn: "দাম্পত্য সম্পর্ক ও মনোবিজ্ঞান বিভাগ",
  website: "WWW.ONUVUTI.SITE",
  editionBn: "প্রথম সংস্করণ: ২০২৬",
  coverImage: BOOK_COVER_IMAGE,
  backCoverImage: BOOK_BACK_IMAGE,
  regularPriceBdt: 220,
  regularPriceBn: "২২০",
  offerPriceBdt: 99,
  offerPriceBn: "৯৯",
  discountPercentBn: "৫৫% ছাড়",
  zinipayProductUrl:
    "https://dash.zinipay.com/onuvuti/product/ca434ea6-acda-4e47-9f80-be86c33c10cf",
  highlights: [
    "ভালোবাসার মনস্তত্ত্ব ও আবেগের বিজ্ঞান",
    "স্পর্শের ভাষা ও অন্তরঙ্গতার কৌশল",
    "দাম্পত্য সম্পর্কে মানসিক নিরাপত্তা ও বিশ্বাস",
    "শরীর–মন–আবেগের সমন্বয়",
    "রোমান্সকে দীর্ঘস্থায়ী করার বাস্তব উপায়",
  ],
};

export const BOOK_PARTS: BookPart[] = [
  {
    id: "part-1",
    partNumberBn: "অংশ ১",
    title: "মনের টান ও ভালোবাসার মূল কথা",
    chapters: [
      {
        numberBn: "০১",
        numberEn: 1,
        title: "কাছাকাছি থেকেও কেন একা লাগে? — সত্যিকারের ভালোবাসার শুরু",
      },
      {
        numberBn: "০২",
        numberEn: 2,
        title: "মনের ভয় ও অভিমান — কেন কেউ কাছে আসে, আর কেউ দূরে সরে?",
      },
      {
        numberBn: "০৩",
        numberEn: 3,
        title: "তাড়াহুড়ো নয়, ভালোবাসা হোক ধীর ও প্রশান্তির",
      },
      {
        numberBn: "০৪",
        numberEn: 4,
        title: "পুরোনো সম্পর্কে নতুন আকর্ষণ — চেনা মানুষের মাঝেও রোমাঞ্চ",
      },
    ],
  },
  {
    id: "part-2",
    partNumberBn: "অংশ ২",
    title: "শরীর ও মনের সহজ বিজ্ঞান",
    chapters: [
      {
        numberBn: "০৫",
        numberEn: 5,
        title: "ভালোবাসার হরমোন — জড়িয়ে ধরা ও আদরে কীভাবে বিশ্বাস বাড়ে?",
      },
      {
        numberBn: "০৬",
        numberEn: 6,
        title: "মনের স্বস্তি ও নিরাপত্তা — ভয় বা তাড়াহুড়ো থাকলে কেন আনন্দ আসে না?",
      },
      {
        numberBn: "০৭",
        numberEn: 7,
        title: "নারীর মনের ইচ্ছা ও অনিচ্ছা — কীভাবে আদর ও যত্নে আগ্রহ জাগাবেন?",
      },
      {
        numberBn: "০৮",
        numberEn: 8,
        title: "মোবাইল ও পর্নের আসক্তি থেকে মুক্তি — বাস্তব জীবনে আনন্দ ফেরানো",
      },
    ],
  },
  {
    id: "part-3",
    partNumberBn: "অংশ ৩",
    title: "ছোঁয়ার জাদু ও আদরের কলাকৌশল",
    chapters: [
      {
        numberBn: "০৯",
        numberEn: 9,
        title: "আদরের ৫টি ধাপ — চুম্বন, মিষ্টি কথা ও গভীর ঘনিষ্ঠতার নিয়ম",
      },
      {
        numberBn: "১০",
        numberEn: 10,
        title: "শরীরের ৭টি সংবেদনশীল স্থান — কোথায় কীভাবে ছুঁলে শিহরণ জাগে?",
      },
      {
        numberBn: "১১",
        numberEn: 11,
        title: "স্ত্রীকে পূর্ণ তৃপ্তি দেওয়ার গোপন রহস্য ও ৪৫ মিনিটের ফোরপ্লে গাইড",
      },
      {
        numberBn: "১২",
        numberEn: 12,
        title: "আরামদায়ক ও আনন্দময় মিলনের ১৮টি সহজ ভঙ্গি (পজিশন গাইড)",
      },
      {
        numberBn: "১৩",
        numberEn: 13,
        title: "চোখে চোখ রাখা ও শান্ত নিঃশ্বাসের জাদু — দীর্ঘক্ষণ আনন্দে থাকার উপায়",
      },
    ],
  },
  {
    id: "part-4",
    partNumberBn: "অংশ ৪",
    title: "মান-অভিমান ভাঙানো, স্থায়িত্ব ও আজীবন রোমান্স",
    chapters: [
      {
        numberBn: "১৪",
        numberEn: 14,
        title: "নিজের ব্যক্তিত্ব ও আত্মবিশ্বাস — সঙ্গীর চোখে আকর্ষণীয় থাকার উপায়",
      },
      {
        numberBn: "১৫",
        numberEn: 15,
        title: "জমে থাকা রাগ, ক্লান্তি ও দূরত্ব দূর করে আবার কাছে আসার উপায়",
      },
      {
        numberBn: "১৬",
        numberEn: 16,
        title: "পুরুষের স্থায়িত্ব ও সময় বাড়ানোর সহজ ও কার্যকর উপায়",
      },
      {
        numberBn: "১৭",
        numberEn: 17,
        title: "মিলনের পরের ১৫ মিনিট — জড়িয়ে ধরা ও যত্ন নেওয়ার গুরুত্ব",
      },
      {
        numberBn: "১৮",
        numberEn: 18,
        title: "চিরসবুজ দাম্পত্য — বয়স বাড়লেও ভালোবাসা ও আকর্ষণ অমলিন রাখা",
      },
    ],
  },
];

export const APPENDICES = [
  "পরিশিষ্ট ক: স্বামী-স্ত্রীর মনের কথা বলার সহজ গাইড",
  "পরিশিষ্ট খ: নিজেদের সম্পর্ক বোঝার ১০টি সহজ প্রশ্ন",
  "পরিশিষ্ট গ: সহায়ক বই ও গবেষণার তালিকা",
  "পরিশিষ্ট ঘ: সুখী দম্পতির প্রতিদিনের শপথ",
];
