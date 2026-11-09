export interface AdultVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  views: number;
  likes: number;
  videoUrl?: string; // Direct video source (mp4/webm/m3u8)
  embedUrl?: string; // Embed iframe src (e.g. YouTube, Vimeo, custom CDN)
  thumbnailUrl?: string;
  quality?: string;
  tags: string[];
  createdAt: string;
}

export interface AdultStory {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  readTime: string;
  likes: number;
  views: number;
  content: string[]; // List of paragraphs
  tags: string[];
  createdAt: string;
}

export const ADULT_CATEGORIES = [
  "All Content",
  "Video Gallery",
  "Intimate Stories",
  "Psychology of Intimacy",
  "Secret Confessions",
] as const;

/**
 * Initial Video Library (Template/Framework)
 */
export const INITIAL_ADULT_VIDEOS: AdultVideo[] = [
  {
    id: "vid-1",
    title: "Intimate Moments & The Art of Touch — Part 1",
    description: "A nuanced exploration of relationship dynamics, sensual psychology, and intimate connection.",
    duration: "08:45 min",
    category: "Exclusive",
    views: 1240,
    likes: 312,
    videoUrl: "",
    embedUrl: "",
    thumbnailUrl: "",
    tags: ["Relationship", "Touch", "18+"],
    createdAt: "2026-11-10",
  },
  {
    id: "vid-2",
    title: "Quiet Hours: The Depth of Connection",
    description: "Understanding emotional vulnerability and bodily harmony in midnight solitude.",
    duration: "12:20 min",
    category: "Romantic",
    views: 980,
    likes: 245,
    videoUrl: "",
    embedUrl: "",
    thumbnailUrl: "",
    tags: ["Romance", "Intimacy", "Psychology"],
    createdAt: "2026-11-10",
  },
  {
    id: "vid-3",
    title: "Unspoken Desires & The Secret Language",
    description: "Words left unsaid, whispered through quiet gestures and the rhythm of breath.",
    duration: "10:15 min",
    category: "Special",
    views: 1520,
    likes: 410,
    videoUrl: "",
    embedUrl: "",
    thumbnailUrl: "",
    tags: ["Desire", "Subtle Touch", "18+"],
    createdAt: "2026-11-10",
  },
];

/**
 * Initial Stories Library (English by default)
 */
export const INITIAL_ADULT_STORIES: AdultStory[] = [
  {
    id: "story-1",
    title: "Shadows in the Moonlight",
    excerpt: "When the lights faded, moonlight sliced through the sheer curtains, washing over us. In the quiet room, there was only the gentle cadence of hurried breaths...",
    author: "Anonymous",
    category: "Intimate Narrative",
    readTime: "5 min read",
    likes: 420,
    views: 1890,
    content: [
      "When the room lights finally dimmed, moonlight slipped through the linen drapes, painting gentle silver lines across the bed. In the quiet expanse of the room, there was nothing but the soft cadence of two synchronizing breaths.",
      "His fingers found mine with an unhurried certainty. Months of restrained desire dissolved into a single, deliberate stroke across my shoulder, sending ripples of warmth beneath my skin.",
      "There was no haste in the way we drew closer, only a profound sense of belonging. In the language of eyes and breathless murmurs, the night surrendered entirely to us.",
    ],
    tags: ["Midnight", "Desire", "Connection"],
    createdAt: "2026-11-10",
  },
  {
    id: "story-2",
    title: "Whispers in the Rain",
    excerpt: "Outside, torrential rain tapped rhythmically against the glass pane. Inside, warm tea sat untouched as distance collapsed between us...",
    author: "Velvet Sky",
    category: "Romantic Fiction",
    readTime: "6 min read",
    likes: 380,
    views: 1450,
    content: [
      "Outside, the monsoon rain fell in relentless sheets, drumming steadily against the foggy glass. Inside, our cold cups of tea sat forgotten on the table as the space between us narrowed to an electric hum.",
      "Her hand grazed my collarbone, her damp perfume and radiant warmth instantly commanding all my senses. Every barrier built by time and distance crumbled in that singular heartbeat.",
      "Over the drone of the rain, every whisper became an intimate melody. That evening remains etched in memory as an unforgettable sanctuary of quiet indulgence.",
    ],
    tags: ["Rain", "Romance", "Intimacy"],
    createdAt: "2026-11-10",
  },
  {
    id: "story-3",
    title: "The Architecture of Touch",
    excerpt: "Touch is not merely skin against skin; it is the soul's most honest dialect. When surrender replaces restraint, intimacy begins...",
    author: "Canvas of Senses",
    category: "Psychology & Art",
    readTime: "4 min read",
    likes: 512,
    views: 2100,
    content: [
      "Touch is far more than physical contact; it is the oldest, most honest dialogue known to humanity. When two people surrender their everyday shields, intimacy transforms into an unspoken art form.",
      "The body speaks a nuanced grammar. Where words falter, fingertips take over—tracing the nape of the neck, reading the pulse at the wrist, and breathing warmth into silent spaces.",
      "Resting in someone's embrace, letting the noise of the world recede into oblivion—there is hardly any intoxicating comfort quite like it.",
    ],
    tags: ["Psychology", "Surrender", "The Language of Touch"],
    createdAt: "2026-11-10",
  },
];
