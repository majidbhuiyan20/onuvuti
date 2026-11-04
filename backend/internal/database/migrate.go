package database

import "database/sql"

const schemaSQL = `
CREATE TABLE IF NOT EXISTS stories (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(220) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    category VARCHAR(80) NOT NULL,
    read_time_bn VARCHAR(50) NOT NULL DEFAULT '৩ মিনিট পাঠ',
    date_bn VARCHAR(60) NOT NULL DEFAULT 'আজ',
    author VARCHAR(120) NOT NULL DEFAULT 'নাম প্রকাশে অনিচ্ছুক',
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin_post BOOLEAN NOT NULL DEFAULT FALSE,
    confession_id_bn VARCHAR(60) DEFAULT '',
    image_url TEXT DEFAULT '',
    admin_note TEXT DEFAULT '',
    views_count INTEGER NOT NULL DEFAULT 120,
    likes_count INTEGER NOT NULL DEFAULT 1,
    reaction_love INTEGER NOT NULL DEFAULT 1,
    reaction_touched INTEGER NOT NULL DEFAULT 0,
    reaction_relatable INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    content_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    raw_content TEXT DEFAULT '',
    status VARCHAR(24) NOT NULL DEFAULT 'pending',
    user_id VARCHAR(64) DEFAULT '',
    submitted_at VARCHAR(60) DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE stories ADD COLUMN IF NOT EXISTS user_id VARCHAR(64) DEFAULT '';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS admin_note TEXT DEFAULT '';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_slug ON stories(slug);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_featured ON stories(featured);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(64) PRIMARY KEY,
    story_id VARCHAR(64) NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    author VARCHAR(120) NOT NULL DEFAULT 'পাঠক',
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    text TEXT NOT NULL,
    time_bn VARCHAR(60) NOT NULL DEFAULT 'এইমাত্র',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_story_id ON comments(story_id, created_at DESC);

CREATE TABLE IF NOT EXISTS book_orders (
    order_id VARCHAR(64) PRIMARY KEY,
    invoice_id VARCHAR(120) DEFAULT '',
    cus_name VARCHAR(120) NOT NULL,
    cus_phone VARCHAR(40) NOT NULL,
    cus_email VARCHAR(140) NOT NULL,
    amount INTEGER NOT NULL DEFAULT 99,
    currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
    transaction_id VARCHAR(120) NOT NULL DEFAULT '',
    payment_method VARCHAR(60) NOT NULL DEFAULT '',
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING',
    download_token TEXT NOT NULL DEFAULT '',
    download_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- Idempotent column migrations for existing databases
ALTER TABLE book_orders ADD COLUMN IF NOT EXISTS invoice_id VARCHAR(120) DEFAULT '';
ALTER TABLE book_orders ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'BDT';
ALTER TABLE book_orders ADD COLUMN IF NOT EXISTS download_token TEXT DEFAULT '';
ALTER TABLE book_orders ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;
ALTER TABLE book_orders ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_book_orders_invoice ON book_orders(invoice_id) WHERE invoice_id != '';
CREATE INDEX IF NOT EXISTS idx_book_orders_status ON book_orders(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_book_orders_trx ON book_orders(transaction_id) WHERE transaction_id != '';

CREATE TABLE IF NOT EXISTS daily_traffic (
    date_key VARCHAR(16) PRIMARY KEY,
    page_views INTEGER NOT NULL DEFAULT 0,
    unique_visits INTEGER NOT NULL DEFAULT 0,
    story_reads INTEGER NOT NULL DEFAULT 0,
    book_page_views INTEGER NOT NULL DEFAULT 0,
    book_orders INTEGER NOT NULL DEFAULT 0,
    revenue_bdt INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL DEFAULT '',
    provider VARCHAR(32) NOT NULL DEFAULT 'manual',
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(64) PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT INTO system_settings (key, value) VALUES ('confession_counter', '104')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS ads (
    slot VARCHAR(64) PRIMARY KEY,
    title VARCHAR(160) NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    link_url TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO ads (slot, title, image_url, link_url, is_active)
VALUES 
    ('left_sidebar', 'স্পর্শের ব্যাকরণ - অনুভূতি পাবলিকেশন্স', '/images/book-cover.png', '/sporsher-byakoron', true),
    ('right_sidebar', 'স্পর্শের ব্যাকরণ - ই-বুক সংগ্রহ করুন', '/images/book-back.png', '/sporsher-byakoron', true)
ON CONFLICT (slot) DO NOTHING;

CREATE TABLE IF NOT EXISTS wellness_tips (
    id VARCHAR(64) PRIMARY KEY,
    category VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    read_time VARCHAR(32) NOT NULL DEFAULT '৩ মিনিট পাঠ',
    symptoms TEXT DEFAULT '',
    why_it_happens TEXT DEFAULT '',
    action_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    psychological_insight TEXT DEFAULT '',
    daily_habit TEXT DEFAULT '',
    expert_advice TEXT DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wellness_tips_active ON wellness_tips(is_active);
CREATE INDEX IF NOT EXISTS idx_wellness_tips_category ON wellness_tips(category);

INSERT INTO wellness_tips (id, category, title, summary, read_time, symptoms, why_it_happens, action_steps, psychological_insight, daily_habit, expert_advice, is_active)
VALUES
    ('tip-1', 'মানসিক স্বাস্থ্য', 'উদ্বেগ, অতিরিক্ত চিন্তা (Overthinking) ও প্যানিক দূর করার বিজ্ঞানসম্মত উপায়', 'যখন মন অহেতুক নানা চিন্তায় অস্থির হয়ে ওঠে এবং বুকের ভেতর অজানা চাপ অনুভূত হয়, তখন ''৫-৪-৩-২-১'' গ্রাউন্ডিং টেকনিক মস্তিষ্ককে তাৎক্ষণিক প্রশান্তি দেয়।', '৩ মিনিট পাঠ', 'মাথায় অবিরাম ভবিষ্যতের ভয়, অতীত ভুলের অনুশোচনা, বুক ধড়ফড় করা এবং কাজে মনোযোগ ধরে রাখতে না পারা।', 'মস্তিষ্কের ইমোশনাল সেন্টার অ্যামিগডালা কাল্পনিক বিপদকে বাস্তব ভেবে অতিরিক্ত স্ট্রেস হরমোন কর্টিসল নিঃসরণ করে।', '["৫টি জিনিস দেখুন: চোখের সামনে থাকা যেকোনো ৫টি বস্তুর দিকে একদৃষ্টে তাকান।", "৪টি জিনিস স্পর্শ করুন: আপনার পোশাক বা টেবিল স্পর্শ করে অনুভূতি টের পান।", "৩টি শব্দ শুনুন: দূরবর্তী ফ্যানের বা পাখির আওয়াজ শুনুন।", "২টি গন্ধ অনুভব করুন: রুমের সুবাস বা যেকোনো গন্ধ নিন।", "১টি গভীর শ্বাস ছাড়ুন: বুক ভরে শ্বাস নিয়ে ধীরে ধীরে ৮ সেকেন্ডে ছাড়ুন।"]'::jsonb, 'মানুষের মন কখনো একই সাথে গভীর ইন্দ্রিয়গ্রাহ্য মনোযোগ এবং কাল্পনিক উদ্বেগ বজায় রাখতে পারে না। এটি মস্তিষ্ককে বর্তমানে ফিরিয়ে আনে।', 'ঘুমানোর আগে ১০ মিনিট ডায়েরির পাতায় সমস্ত দুশ্চিন্তা লিখে ফেলুন (Brain Dump)।', 'উদ্বেগ আপনার পরিচয় নয়, এটি সাময়িক অনুভূতি। মনের সাথে যুদ্ধ না করে বন্ধুসুলভ দৃষ্টিতে পর্যবেক্ষণ করুন।', true),
    ('tip-2', 'সম্পর্কের যত্ন', 'সম্পর্কে মানসিক দূরত্ব ও ইগো সমাধানের কার্যকরী কৌশল', 'সম্পর্কে জিতে যাওয়ার চেয়ে প্রিয় মানুষটাকে ধরে রাখা অনেক বড় সাফল্য। ইগো বা না বলা অভিমান জমতে না দিয়ে কীভাবে গভীর যোগাযোগ পুনঃস্থাপন করবেন?', '৪ মিনিট পাঠ', 'কথাবার্তা কমে যাওয়া, প্রতিটি বিষয়ে তর্ক বা খোঁচা দেওয়া, মনের কথা শেয়ার করার ইচ্ছে হারিয়ে ফেলা।', 'দীর্ঘদিন ধরে ছোট ছোট অভিমান প্রকাশ না করে চেপে রাখলে মনের ভেতর অদৃশ্য দেয়াল তৈরি হয়।', '["I স্টেটমেন্ট ব্যবহার করুন: ''তুমি সবসময় এমন করো'' না বলে বলুন—''তোমার এমন আচরণে আমি কষ্ট পেয়েছি''।", "ডিজিটাল ডিটক্স টক: প্রতিদিন অন্তত ১৫ মিনিট সব ফোন দূরে রেখে একে অপরের চোখের দিকে তাকিয়ে কথা বলুন।", "অতীত ভুলের অস্ত্র না বানানো: বর্তমান সমস্যা নিয়ে কথা বলার সময় পুরোনো ভুল টেনে আনবেন না।", "ছোট ছোট ধন্যবাদ ও প্রশংসা: সঙ্গীর ক্ষুদ্রতম ভালো কাজেরও মুখে উচ্চারণ করে প্রশংসা করুন।"]'::jsonb, 'মানুষ সেখানেই নিজেকে সঁপে দেয়, যেখানে সে বিচারহীনভাবে নিরাপদ ও গৃহীত বোধ করে। সম্মান যেখানে থাকে, প্রেম সেখানে অনন্তকাল টিকে থাকে।', 'দিন শেষে সঙ্গীকে একটি সুন্দর বার্তা পাঠান বা বলুন: ''আজকের দিনে তোমার পাশে থাকতে পেরে আমি কৃতজ্ঞ।''', 'যেকোনো তর্কের সময় ভাবুন: ''আমি কি তর্কে জিততে চাই, নাকি সম্পর্ককে বাঁচাতে চাই?'' ইগো জিতলে সম্পর্ক হেরে যায়।', true),
    ('tip-3', 'ঘুম ও মানসিক প্রশান্তি', 'গভীর ঘুম ও ইনসমনিয়া থেকে মুক্তির কার্যকরী স্লিপ রুটিন', 'রাতে বিছানায় যাওয়ার পর দীর্ঘক্ষণ এপাশ-ওপাশ করা এবং ক্লান্ত সকালে ঘুম ভাঙা বন্ধ করতে বৈজ্ঞানিক স্লিপ হাইজিন চর্চা করুন।', '৩ মিনিট পাঠ', 'বিছানায় যাওয়ার ১-২ ঘণ্টা পরেও ঘুম না আসা, মধ্যরাতে বারবার ঘুম ভেঙে যাওয়া, সকালে শরীর ক্লান্ত থাকা।', 'মোবাইল ও ল্যাপটপের কৃত্রিম নীল আলো স্লিপ হরমোন মেলাটোনিন নিঃসরণ আটকে দেয়।', '["৪৫ মিনিট পূর্বে নো-স্ক্রিন রুল: ঘুমানোর অন্তত ৪৫ মিনিট পূর্বে মোবাইল চার্জে দিয়ে বিছানা থেকে দূরে রাখুন।", "রুমের তাপমাত্রা ও আলো: শোবার ঘরটি অন্ধকার ও ঠান্ডা রাখুন। মৃদু হলুদ আলো ঘুমে সাহায্য করে।", "৪-৭-৮ শ্বাসচর্চা: ৪ সেকেন্ড শ্বাস নিন, ৭ সেকেন্ড ধরে রাখুন, ৮ সেকেন্ড মুখ দিয়ে ধীরে ছাড়ুন।", "বিছানাকে শুধু ঘুমের স্থান রাখুন: বিছানায় বসে ল্যাপটপে কাজ করা বা খাওয়া পরিহার করুন।"]'::jsonb, 'ভালো ঘুম মস্তিষ্কের গ্লিম্ফ্যাটিক সিস্টেম সচল করে স্মৃতি গুছিয়ে রাখে ও বিষণ্ণতা ৫০% কমিয়ে আনে।', 'প্রতিদিন সকালে ঘুম থেকে ওঠার পর অন্তত ১০ মিনিট ভোরের রোদে দাঁড়ান।', 'বিছানায় শোয়ার পর ২০ মিনিটের বেশি ঘুম না আসলে জোর করবেন না। উঠে হালকা আলোয় ৫ মিনিট বই পড়ুন।', true)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS daily_polls (
    id VARCHAR(64) PRIMARY KEY,
    question TEXT NOT NULL,
    options_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_polls_active ON daily_polls(is_active);

INSERT INTO daily_polls (id, question, options_json, is_active)
VALUES (
    'poll-1',
    'তুমি কি কখনো কাউকে না জানিয়েই ভালোবেসেছ?',
    '[{"id":"opt-1","label":"হ্যাঁ, এখনো বাসি","votes":142},{"id":"opt-2","label":"একসময় বাসতাম","votes":98},{"id":"opt-3","label":"কখনো এমন হয়নি","votes":24}]'::jsonb,
    true
) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS daily_quotes (
    id VARCHAR(64) PRIMARY KEY,
    quote TEXT NOT NULL,
    author VARCHAR(120) NOT NULL DEFAULT 'একজন অজ্ঞাত পাঠক',
    react_count INTEGER NOT NULL DEFAULT 128,
    story_id VARCHAR(64) DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_quotes_active ON daily_quotes(is_active);

INSERT INTO daily_quotes (id, quote, author, react_count, is_active)
VALUES (
    'quote-1',
    'তোমাকে ভুলে যাওয়ার চেষ্টা করতে করতে, তোমাকেই আরও বেশি মনে পড়ে।',
    'একজন অজ্ঞাত পাঠক',
    128,
    true
) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS birthday_wishes (
    id VARCHAR(64) PRIMARY KEY,
    recipient_name VARCHAR(120) NOT NULL,
    sender_name VARCHAR(120) NOT NULL,
    relationship VARCHAR(60) NOT NULL DEFAULT 'বিশেষ কেউ',
    message TEXT NOT NULL,
    theme VARCHAR(32) NOT NULL DEFAULT 'vintage_rose',
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_birthday_wishes_created_at ON birthday_wishes(created_at DESC);

ALTER TABLE birthday_wishes ADD COLUMN IF NOT EXISTS font_style VARCHAR(16) NOT NULL DEFAULT 'classic';
ALTER TABLE birthday_wishes ADD COLUMN IF NOT EXISTS music VARCHAR(24) NOT NULL DEFAULT 'none';
ALTER TABLE birthday_wishes ADD COLUMN IF NOT EXISTS photo_url TEXT NOT NULL DEFAULT '';
ALTER TABLE birthday_wishes ADD COLUMN IF NOT EXISTS voice_url TEXT NOT NULL DEFAULT '';
ALTER TABLE birthday_wishes ADD COLUMN IF NOT EXISTS unlock_at TIMESTAMPTZ;
ALTER TABLE birthday_wishes ADD COLUMN IF NOT EXISTS passcode_salt VARCHAR(64) NOT NULL DEFAULT '';
ALTER TABLE birthday_wishes ADD COLUMN IF NOT EXISTS passcode_hash VARCHAR(128) NOT NULL DEFAULT '';
ALTER TABLE birthday_wishes ADD COLUMN IF NOT EXISTS self_destruct BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE birthday_wishes ADD COLUMN IF NOT EXISTS destroyed_at TIMESTAMPTZ;
ALTER TABLE birthday_wishes ADD COLUMN IF NOT EXISTS manage_key_hash VARCHAR(128) NOT NULL DEFAULT '';
ALTER TABLE birthday_wishes ADD COLUMN IF NOT EXISTS failed_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE birthday_wishes ADD COLUMN IF NOT EXISTS last_failed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS wish_replies (
    id VARCHAR(40) PRIMARY KEY,
    wish_id VARCHAR(64) NOT NULL REFERENCES birthday_wishes(id) ON DELETE CASCADE,
    emoji VARCHAR(16) NOT NULL DEFAULT '❤️',
    text TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wish_replies_wish_id ON wish_replies(wish_id, created_at DESC);
`

func RunMigrations(db *sql.DB) error {
	_, err := db.Exec(schemaSQL)
	return err
}
