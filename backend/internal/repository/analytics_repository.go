package repository

import (
	"fmt"
	"log"
	"sort"
	"strings"
	"time"

	"github.com/onuvuti/backend/internal/models"
)

var bnMonthsShort = []string{"জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"}

func formatBnMonthDay(t time.Time) string {
	return fmt.Sprintf("%d %s", t.Day(), bnMonthsShort[int(t.Month())-1])
}

func (r *Repository) RecordVisit(path, storyID string, isNewVisitor bool) {
	now := time.Now()
	dateKey := now.Format("2006-01-02")
	cleanPath := strings.ToLower(strings.TrimSpace(path))

	isBook := strings.Contains(cleanPath, "/sporsher-")
	newUnique := 0
	if isNewVisitor {
		newUnique = 1
	}

	storyReadsInc := 1
	bookViewsInc := 0
	if isBook {
		storyReadsInc = 0
		bookViewsInc = 1
	}

	if r.db != nil {
		_, err := r.db.Exec(`
			INSERT INTO daily_traffic (date_key, page_views, unique_visits, story_reads, book_page_views, book_orders, revenue_bdt)
			VALUES ($1, 1, $2, $3, $4, 0, 0)
			ON CONFLICT (date_key) DO UPDATE SET
				page_views = daily_traffic.page_views + 1,
				unique_visits = daily_traffic.unique_visits + $2,
				story_reads = daily_traffic.story_reads + $3,
				book_page_views = daily_traffic.book_page_views + $4
		`, dateKey, newUnique, storyReadsInc, bookViewsInc)
		if err != nil {
			log.Printf("⚠️ PostgreSQL RecordVisit error: %v", err)
		}

		if storyID != "" {
			_, _ = r.db.Exec(`
				UPDATE stories
				SET views_count = views_count + 1
				WHERE id = $1 OR slug = $1
			`, storyID)
		}
		return
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	stat, exists := r.mem.TrafficByDate[dateKey]
	if !exists {
		stat = models.DailyTrafficStat{
			Date:    dateKey,
			LabelBn: formatBnMonthDay(now),
		}
	}

	stat.PageViews++
	if isNewVisitor {
		stat.UniqueVisits++
	}
	if isBook {
		stat.BookPageViews++
	} else {
		stat.StoryReads++
	}
	r.mem.TrafficByDate[dateKey] = stat

	if storyID != "" {
		for i, st := range r.mem.Stories {
			if st.ID == storyID || st.Slug == storyID {
				st.ViewsCount++
				r.mem.Stories[i] = st
				break
			}
		}
	}
}

func (r *Repository) GetTrafficStatsBetween(startDate, endDate string) ([]models.DailyTrafficStat, []models.TopStoryStat) {
	if r.db != nil {
		rows, err := r.db.Query(`
			SELECT date_key, page_views, unique_visits, story_reads, book_page_views, book_orders, revenue_bdt
			FROM daily_traffic
			WHERE date_key >= $1 AND date_key <= $2
			ORDER BY date_key ASC
		`, startDate, endDate)
		if err != nil {
			log.Printf("⚠️ PostgreSQL GetTrafficStatsBetween error: %v", err)
			return []models.DailyTrafficStat{}, []models.TopStoryStat{}
		}
		defer rows.Close()

		var timeline []models.DailyTrafficStat
		for rows.Next() {
			var s models.DailyTrafficStat
			if err := rows.Scan(&s.Date, &s.PageViews, &s.UniqueVisits, &s.StoryReads, &s.BookPageViews, &s.BookOrders, &s.RevenueBdt); err == nil {
				parsedDate, err := time.Parse("2006-01-02", s.Date)
				if err == nil {
					s.LabelBn = formatBnMonthDay(parsedDate)
				} else {
					s.LabelBn = s.Date
				}
				timeline = append(timeline, s)
			}
		}
		if timeline == nil {
			timeline = []models.DailyTrafficStat{}
		}

		// Top 6 Stories from PostgreSQL
		topRows, err := r.db.Query(`
			SELECT id, slug, title, category, views_count, likes_count
			FROM stories
			WHERE status = 'published'
			ORDER BY views_count DESC
			LIMIT 6
		`)
		var topStories []models.TopStoryStat
		if err == nil {
			defer topRows.Close()
			for topRows.Next() {
				var ts models.TopStoryStat
				if err := topRows.Scan(&ts.ID, &ts.Slug, &ts.Title, &ts.Category, &ts.ViewsCount, &ts.LikesCount); err == nil {
					topStories = append(topStories, ts)
				}
			}
		}
		if topStories == nil {
			topStories = []models.TopStoryStat{}
		}

		return timeline, topStories
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	var timeline []models.DailyTrafficStat
	for dateKey, stat := range r.mem.TrafficByDate {
		if dateKey >= startDate && dateKey <= endDate {
			timeline = append(timeline, stat)
		}
	}

	sort.Slice(timeline, func(i, j int) bool {
		return timeline[i].Date < timeline[j].Date
	})

	var topStories []models.TopStoryStat
	for _, st := range r.mem.Stories {
		if st.Status != "published" {
			continue
		}
		views := st.ViewsCount
		if views == 0 {
			views = st.LikesCount*4 + 120
		}
		topStories = append(topStories, models.TopStoryStat{
			ID:         st.ID,
			Slug:       st.Slug,
			Title:      st.Title,
			Category:   st.Category,
			ViewsCount: views,
			LikesCount: st.LikesCount,
		})
	}

	sort.Slice(topStories, func(i, j int) bool {
		return topStories[i].ViewsCount > topStories[j].ViewsCount
	})
	if len(topStories) > 6 {
		topStories = topStories[:6]
	}

	return timeline, topStories
}
