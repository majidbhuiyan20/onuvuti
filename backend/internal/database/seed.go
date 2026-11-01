package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/onuvuti/backend/internal/models"
)

func InitialStories() []models.Story {
	now := time.Now()
	return []models.Story{
		{
			ID:         "1",
			Slug:       "middle-class-husband-silent-love",
			Title:      "মধ্যবিত্ত স্বামীর পকেটে থাকা চিরকুট ও এক কাপ চায়ের ভালোবাসা",
			Excerpt:    "বিয়ের পাঁচ বছর পর মনে হতো আমাদের মাঝে আর কোনো রোমান্স নেই। কিন্তু সেদিন বৃষ্টির সন্ধ্যায় ওর মানিব্যাগে পাওয়া একটি পুরোনো কাগজ আমার ভুল ভেঙে দিল...",
			Category:   "রোমান্টিক গল্প",
			ReadTimeBn: "৪ মিনিট পাঠ",
			DateBn:     "১ নভেম্বর ২০২৬",
			Author:     "মালিহা তাবাসসুম, ঢাকা",
			ViewsCount: 1420,
			LikesCount: 248,
			Reactions:  models.Reactions{Love: 248, Touched: 94, Relatable: 67},
			Featured:   true,
			Content: []string{
				"সংসারের হাজারো ব্যস্ততায় আমাদের কথাগুলো কেমন যেন হিসাবের খাতায় বন্দি হয়ে গিয়েছিল—‘বাজার এনেছো?’, ‘কারেন্ট বিল দিয়েছো?’, ‘বাচ্চার স্কুলের ফি কবে?’। আমার মাঝে মাঝে ভীষণ অভিমান হতো। মনে হতো, বিয়ের প্রথম বছরের সেই মানুষটা কোথায় হারিয়ে গেল?",
				"গত বৃহস্পতিবার বাইরে তুমুল বৃষ্টি। অফিস থেকে ফেরার পর ওর ভেজা শার্টটা ধুতে গিয়ে পকেট থেকে মানিব্যাগটা বের করলাম। ভেতরের একটা ছোট্ট ভাঁজ করা কাগজ চোখে পড়ল। খুলে দেখি—তিন বছর আগে আমার রাগ করে লেখা একটা চিরকুট, যেখানে আমি লিখেছিলাম: ‘তুমি আমাকে একদম সময় দাও না!’ আর তার ঠিক নিচে ওর হাতের লেখা: ‘আমি হয়তো মুখে বলতে পারি না, কিন্তু আমার সমস্ত পরিশ্রম শুধু তোমার মুখের একটুখানি হাসির জন্য।’",
				"চোখের পানি আটকে রাখতে পারিনি। সেদিন সন্ধ্যায় বারান্দায় দাঁড়িয়ে দুজনে এক কাপ চা ভাগ করে খেলাম। কোনো কথা হয়নি, শুধু ওর হাতটা শক্ত করে ধরে রেখেছিলাম। কিছু স্পর্শ আসলেই হাজার শব্দের চেয়েও গভীর।",
			},
			Status:    "published",
			CreatedAt: now,
		},
		{
			ID:             "2",
			Slug:           "campus-library-blue-kurti-crush-confession",
			Title:          "লাইব্রেরির তিন নম্বর টেবিলের সেই নীল কুর্তি পরা মেয়েটিকে যা আজও বলা হয়নি",
			Excerpt:        "টানা দুই বছর প্রতিদিন বিকেল চারটায় সেন্ট্রাল লাইব্রেরিতে যেতাম শুধু তোমার চশমার ফাঁক দিয়ে তাকানো দেখব বলে। আজ ক্যাম্পাস শেষ, তবু কথাটা বুকেই রয়ে গেল...",
			Category:       "ক্রাশ ও কনফেশন",
			ConfessionIdBn: "#কনফেশন_১০৪",
			ReadTimeBn:     "৩ মিনিট পাঠ",
			DateBn:         "১ নভেম্বর ২০২৬",
			Author:         "নাম প্রকাশে অনিচ্ছুক",
			IsAnonymous:    true,
			ViewsCount:     2190,
			LikesCount:     385,
			Reactions:      models.Reactions{Love: 385, Touched: 142, Relatable: 210},
			Content: []string{
				"তুমি হয়তো কোনোদিন জানবেও না, লাইব্রেরির কোনার সিটে বসে থাকা ছেলেটা আসলে বিসিএসের বই পড়ত না—বইয়ের আড়াল থেকে তোমার কপালে এসে পড়া অবাধ্য চুলগুলো সরানো দেখত।",
				"একদিন বৃষ্টিতে আটকে গিয়ে যখন সিঁড়ির নিচে দাঁড়িয়ে ছিলে, আমার ব্যাগে ছাতাটা থাকা সত্ত্বেও শুধু তোমার পাশে আরও দশটা মিনিট দাঁড়িয়ে থাকব বলে ছাতাটা বের করিনি। সাহস করে কোনোদিন নামটাও জিজ্ঞেস করা হয়নি। যদি কখনো এই কনফেশনটা তোমার চোখে পড়ে, জেনে রেখো—নীল কুর্তিতে তোমাকে আজও আমার কল্পনায় পৃথিবীর সবচেয়ে মায়াবী মানুষ মনে হয়।",
			},
			Status:    "published",
			CreatedAt: now,
		},
		{
			ID:          "3",
			Slug:        "unspoken-letter-late-night",
			Title:       "পাশাপাশি শুয়ে থেকেও যে কথাটা আজও তোমাকে বলা হয়নি...",
			Excerpt:     "তুমি যখন গভীর ঘুমে তলিয়ে যাও, আমি তখনও তোমার কপালে হাত বুলিয়ে ভাবি—ইশ, যদি দিনের বেলার অভিমানগুলো মুছে ফেলা যেত!",
			Category:    "না বলা কথা",
			ReadTimeBn:  "৩ মিনিট পাঠ",
			DateBn:      "৩০ অক্টোবর ২০২৬",
			Author:      "নাম প্রকাশে অনিচ্ছুক",
			IsAnonymous: true,
			AdminNote:   "অভিমান জমিয়ে না রেখে একদিন আলতো করে তাঁর হাতটা ধরে মনের কথাটা বলেই দেখুন। সম্পর্কে নীরবতা ভাঙার প্রথম পদক্ষেপটাই সবচেয়ে সুন্দর পরিবর্তন আনে। — অনুভূতি সম্পাদনা পর্ষদ",
			ViewsCount:  1680,
			LikesCount:  312,
			Reactions:   models.Reactions{Love: 312, Touched: 175, Relatable: 129},
			Content: []string{
				"প্রিয়, দিনের বেলা সংসারের চাপে আর ক্লান্তিতে হয়তো তোমার সাথে অনেক সময় খিটমিট করি। তুমি যখন অফিস থেকে ক্লান্ত হয়ে ফেরো, তখন হয়তো আমারও সারাদিনের একা থাকার অভিমান উথলে ওঠে।",
				"কিন্তু রাত গভীর হলে তুমি যখন পাশ ফিরে ঘুমিয়ে পড়ো, তখন আমার সমস্ত রাগ জলের মতো গলে যায়। খুব ইচ্ছা করে তোমাকে জড়িয়ে ধরে বলি—‘আমার একটুখানি আদর আর তোমার বুকের নিরাপদ আশ্রয় ছাড়া আর কিচ্ছু চাই না।’ লজ্জায় আর অভিমানে কথাটা গলার কাছেই আটকে থাকে।",
			},
			Status:    "published",
			CreatedAt: now,
		},
		{
			ID:         "4",
			Slug:       "ten-years-of-waiting-and-reunion",
			Title:      "দশ বছর পর স্টেশনে দেখা: কিছু মানুষ জীবন থেকে হারিয়ে গেলেও মন থেকে হারায় না",
			Excerpt:    "কমলাপুর স্টেশনের ভিড়ে হঠাৎ চেনা পারফিউমের ঘ্রাণ আর সেই পরিচিত কণ্ঠস্বর—‘ভালো আছো?’। বুকের ভেতরটা মুহূর্তেই থমকে গেল।",
			Category:   "বিচ্ছেদ ও প্রাক্তন",
			ReadTimeBn: "৫ মিনিট পাঠ",
			DateBn:     "২৮ অক্টোবর ২০২৬",
			Author:     "তানভীর আহমেদ, সিলেট",
			ViewsCount: 1340,
			LikesCount: 274,
			Reactions:  models.Reactions{Love: 274, Touched: 198, Relatable: 115},
			Content: []string{
				"বিশ্ববিদ্যালয় জীবনের শেষ দিনটাতে পরিবারের চাপে আমাদের পথ আলাদা হয়ে গিয়েছিল। কোনো অভিযোগ ছিল না কারোরই, শুধু নীরব এক দীর্ঘশ্বাস নিয়ে দুজন দুই শহরের মানুষ হয়ে গিয়েছিলাম।",
				"দীর্ঘ দশ বছর পর গত মাসে ট্রেনের অপেক্ষায় দাঁড়িয়ে আছি। হঠাৎ পেছন থেকে খুব চেনা একটা কণ্ঠস্বর। ফিরে তাকিয়ে দেখি, সময়ের ছাপ পড়েছে চোখে-মুখে, কিন্তু চোখের সেই মায়া আজও অবিকল আগের মতোই আছে। মাত্র দুই মিনিটের কুশল বিনিময়, অথচ মনে হলো এক যুগের জমানো মেঘ মুহূর্তেই হালকা হয়ে গেল।",
			},
			Status:    "published",
			CreatedAt: now,
		},
		{
			ID:         "5",
			Slug:       "first-hold-of-hand-after-nikah",
			Title:      "কবুল বলার পর প্রথমবার হাত ছোঁয়ার সেই কাঁপুনি ও অদ্ভুত প্রশান্তি",
			Excerpt:    "দুই পরিবারের পারিবারিক আয়োজনে বিয়ে। মানুষটাকে আগে কখনো কাছ থেকে দেখিনি। কিন্তু প্রথম রাতের একটি কথাই আমাকে সারাজীবনের জন্য তাঁর করে নিল।",
			Category:   "রোমান্টিক গল্প",
			ReadTimeBn: "৪ মিনিট পাঠ",
			DateBn:     "২৫ অক্টোবর ২০২৬",
			Author:     "সাদিয়া আফরিন, রাজশাহী",
			ViewsCount: 2450,
			LikesCount: 420,
			Reactions:  models.Reactions{Love: 420, Touched: 230, Relatable: 95},
			Content: []string{
				"অ্যারেঞ্জড ম্যারেজ হওয়ায় মনের ভেতর ভীষণ ভয় আর জড়তা কাজ করছিল। অপরিচিত একটা মানুষ, নতুন ঘর, নতুন পরিবেশ—হাত-পা ঠান্ডা হয়ে আসছিল।",
				"উনি ঘরে ঢুকে কোনো তাড়াহুড়ো করলেন না। আমার সামনে বসে খুব নরম গলায় বললেন, ‘ভয় পেয়ো না। আজ থেকে এই ঘরটা যেমন আমার, ঠিক তেমনই তোমার। তোমার যতদিন সময় লাগে আমাকে আপন করে নিতে, আমি অপেক্ষা করব।’ কথাটা বলে আলতো করে আমার হাতের ওপর হাত রাখলেন। সেই এক ছোঁয়াতেই আমার সমস্ত ভয় নিমেষে উবে গিয়েছিল।",
			},
			Status:    "published",
			CreatedAt: now,
		},
		{
			ID:          "6",
			Slug:        "forgive-me-for-my-silence",
			Title:       "পুরুষ মানুষ হয়ে জন্মেছি বলেই হয়তো কান্নাটা কাউকে দেখাতে পারিনি",
			Excerpt:     "সবাই ভাবে ছেলেদের মন পাথরের তৈরি। কিন্তু মাস শেষে ফাঁকা পকেট আর প্রিয় মানুষের আবদার মেটাতে না পারার কষ্ট যে কতটা ভারী, তা কেবল বালিশই জানে।",
			Category:    "জীবনের গল্প",
			ReadTimeBn:  "৩ মিনিট পাঠ",
			DateBn:      "২১ অক্টোবর ২০২৬",
			Author:      "নাম প্রকাশে অনিচ্ছুক",
			IsAnonymous: true,
			ViewsCount:  2890,
			LikesCount:  510,
			Reactions:   models.Reactions{Love: 510, Touched: 340, Relatable: 289},
			Content: []string{
				"ছোটবেলা থেকে শুনে বড় হয়েছি—‘ছেলেদের কাঁদতে নেই’। তাই বাবা মারা যাওয়ার পর যখন পুরো পরিবারের দায়িত্ব কাঁধে পড়ল, তখনো একফোঁটা চোখের পানি কাউকে দেখাইনি।",
				"কিন্তু মানুষ তো রক্ত-মাংসেরই তৈরি। সারাদিন ছোটাছুটির পর রাতে যখন বাসায় ফিরি, তখন খুব ইচ্ছা করে কেউ একজন মাথায় হাত বুলিয়ে জিজ্ঞেস করুক—‘সারাদিন অনেক কষ্ট হয়েছে তাই না?’ আমাদের পুরুষদের চাওয়া আসলে খুব অল্প, শুধু একটুখানি মানসিক আশ্রয়।",
			},
			Status:    "published",
			CreatedAt: now,
		},
		{
			ID:          "7",
			Slug:        "why-emotional-foreplay-matters-before-touch",
			Title:       "সম্পর্কে শারীরিক কাছে আসার আগে মানসিক প্রস্তুতি কেন সবচেয়ে জরুরি?",
			Excerpt:     "মনোবিজ্ঞানীরা বলেন, নারীর কাছে ঘনিষ্ঠতার শুরু হয় মূলত অনুভূতি ও নিরাপদ মানসিক আশ্রয় থেকে। সম্পর্ককে প্রাণবন্ত রাখার মনস্তাত্ত্বিক রহস্য...",
			Category:    "সম্পর্ক ও মনস্তত্ত্ব",
			ReadTimeBn:  "৫ মিনিট পাঠ",
			DateBn:      "১৮ অক্টোবর ২০২৬",
			Author:      "অনুভূতি সম্পাদনা পর্ষদ",
			IsAdminPost: true,
			ViewsCount:  1975,
			LikesCount:  365,
			Reactions:   models.Reactions{Love: 365, Touched: 150, Relatable: 180},
			Content: []string{
				"আমাদের সমাজে দাম্পত্য সম্পর্ক নিয়ে কথা বলা এখনো ট্যাবু। অথচ একটুখানি সহমর্মিতা, দিনের বেলা একটি মিষ্টি মেসেজ কিংবা কাজের ফাঁকে একটুখানি খোঁজ নেওয়া—এই ছোট ছোট যত্নগুলোই সম্পর্কের উষ্ণতা বহুগুণ বাড়িয়ে দেয়।",
				"মনোবিজ্ঞানের ভাষায় একে বলা হয় ‘ইমোশনাল ইন্টিমেসি’। যখন দুটি মানুষের মনের দূরত্ব ঘুচে যায়, তখনই প্রতিটি স্পর্শ হয়ে ওঠে অর্থপূর্ণ ও প্রশান্তিময়। এই বিষয়গুলো নিয়েই বিস্তারিত আলোচনা করা হয়েছে আমাদের ‘স্পর্শের ব্যাকরণ’ বইটিতে।",
			},
			Status:    "published",
			CreatedAt: now,
		},
		{
			ID:          "p-101",
			Slug:        "bus-window-girl-unfinished-story",
			Title:       "বাসের জানালার পাশের সেই মেয়েটি ও একটি অসমাপ্ত গল্প",
			Excerpt:     "প্রতিদিন অফিস যাওয়ার পথে শাহবাগ মোড়ে বাসে উঠত মেয়েটা। হাতে সবসময় একটা বই থাকত...",
			Category:    "ক্রাশ ও কনফেশন",
			Author:      "রাফসান কবির, ঢাকা",
			RawContent:  "প্রতিদিন অফিস যাওয়ার পথে শাহবাগ মোড়ে বাসে উঠত মেয়েটা। হাতে সবসময় একটা বই থাকত। একদিন সাহস করে কথা বলব ভেবেছিলাম, কিন্তু পরদিন থেকে তাকে আর দেখিনি...",
			Content:     []string{"প্রতিদিন অফিস যাওয়ার পথে শাহবাগ মোড়ে বাসে উঠত মেয়েটা। হাতে সবসময় একটা বই থাকত। একদিন সাহস করে কথা বলব ভেবেছিলাম, কিন্তু পরদিন থেকে তাকে আর দেখিনি..."},
			Status:      "pending",
			SubmittedAt: "১০ মিনিট আগে",
			CreatedAt:   now,
		},
		{
			ID:          "p-102",
			Slug:        "motherhood-and-dreams-in-almirah",
			Title:       "মা হওয়ার পর নিজের স্বপ্নগুলো যখন আলমারির কোণে জমে থাকে",
			Excerpt:     "সংসার আর সন্তানের মুখের দিকে তাকিয়ে সব কষ্ট ভুলে যাই ঠিকই, কিন্তু মাঝে মাঝে মধ্যরাতে...",
			Category:    "না বলা কথা",
			Author:      "নাম প্রকাশে অনিচ্ছুক",
			IsAnonymous: true,
			RawContent:  "সংসার আর সন্তানের মুখের দিকে তাকিয়ে সব কষ্ট ভুলে যাই ঠিকই, কিন্তু মাঝে মাঝে মধ্যরাতে নিজের পুরোনো সার্টিফিকেটগুলো ছুঁয়ে দেখতে ইচ্ছা করে...",
			Content:     []string{"সংসার আর সন্তানের মুখের দিকে তাকিয়ে সব কষ্ট ভুলে যাই ঠিকই, কিন্তু মাঝে মাঝে মধ্যরাতে নিজের পুরোনো সার্টিফিকেটগুলো ছুঁয়ে দেখতে ইচ্ছা করে..."},
			Status:      "pending",
			SubmittedAt: "১ ঘণ্টা আগে",
			CreatedAt:   now,
		},
	}
}

// InitialDailyTraffic seeds 365 days of baseline traffic data so Daily, 7-Day, Monthly, Yearly & Custom Date filters work immediately.
func InitialDailyTraffic() map[string]models.DailyTrafficStat {
	stats := make(map[string]models.DailyTrafficStat)
	now := time.Now()
	bnMonths := []string{"জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"}

	for i := 364; i >= 0; i-- {
		d := now.AddDate(0, 0, -i)
		dateKey := d.Format("2006-01-02")
		dayVariation := (d.Day()*17 + int(d.Weekday())*31 + i*7) % 180
		views := 340 + dayVariation
		unique := int(float64(views) * 0.68)
		reads := int(float64(views) * 0.74)
		bookViews := int(float64(views) * 0.26)
		orders := (dayVariation % 5) + 1
		rev := orders * 99

		label := fmt.Sprintf("%d %s", d.Day(), bnMonths[int(d.Month())-1])
		stats[dateKey] = models.DailyTrafficStat{
			Date:          dateKey,
			LabelBn:       label,
			PageViews:     views,
			UniqueVisits:  unique,
			StoryReads:    reads,
			BookPageViews: bookViews,
			BookOrders:    orders,
			RevenueBdt:    rev,
		}
	}
	return stats
}

func SeedPostgresIfEmpty(db *sql.DB) error {
	var storyCount int
	if err := db.QueryRow(`SELECT COUNT(*) FROM stories`).Scan(&storyCount); err == nil && storyCount == 0 {
		stories := InitialStories()
		for _, st := range stories {
			contentBytes, _ := json.Marshal(st.Content)
			_, err := db.Exec(`
				INSERT INTO stories (
					id, slug, title, excerpt, category, read_time_bn, date_bn, author,
					is_anonymous, is_admin_post, confession_id_bn, image_url, admin_note,
					views_count, likes_count, reaction_love, reaction_touched, reaction_relatable,
					featured, content_json, raw_content, status, user_id, submitted_at, created_at
				) VALUES (
					$1,$2,$3,$4,$5,$6,$7,$8,
					$9,$10,$11,$12,$13,
					$14,$15,$16,$17,$18,
					$19,$20,$21,$22,$23,$24,$25
				)
				ON CONFLICT (id) DO NOTHING
			`,
				st.ID, st.Slug, st.Title, st.Excerpt, st.Category, st.ReadTimeBn, st.DateBn, st.Author,
				st.IsAnonymous, st.IsAdminPost, st.ConfessionIdBn, st.ImageURL, st.AdminNote,
				st.ViewsCount, st.LikesCount, st.Reactions.Love, st.Reactions.Touched, st.Reactions.Relatable,
				st.Featured, string(contentBytes), st.RawContent, st.Status, st.UserID, st.SubmittedAt, st.CreatedAt,
			)
			if err != nil {
				log.Printf("⚠️ Seed story error: %v", err)
			}
		}
		log.Printf("✅ Seeded initial %d stories into PostgreSQL", len(stories))
	}

	// NOTE: In production, daily_traffic is strictly populated by genuine real-time visitor tracking
	// and verified book payments. We do NOT seed fabricated traffic, orders, or historical revenue.

	return nil
}

