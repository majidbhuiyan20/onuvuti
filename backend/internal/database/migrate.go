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
    cus_name VARCHAR(120) NOT NULL,
    cus_phone VARCHAR(40) NOT NULL,
    cus_email VARCHAR(140) NOT NULL,
    amount INTEGER NOT NULL DEFAULT 99,
    transaction_id VARCHAR(80) NOT NULL,
    payment_method VARCHAR(60) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'PAID',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
`

func RunMigrations(db *sql.DB) error {
	_, err := db.Exec(schemaSQL)
	return err
}
