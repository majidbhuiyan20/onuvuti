package repository

import (
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/onuvuti/backend/internal/models"
)

var bnMonthsShort = []string{"জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"}

func (r *Repository) RecordVisit(path, storyID string, isNewVisitor bool) {
	r.mu.Lock()
	defer r.mu.Unlock()

	now := time.Now()
	dateKey := now.Format("2006-01-02")
	stat, exists := r.state.TrafficByDate[dateKey]
	if !exists {
		stat = models.DailyTrafficStat{
			Date:    dateKey,
			LabelBn: fmt.Sprintf("%d %s", now.Day(), bnMonthsShort[int(now.Month())-1]),
		}
	}

	stat.PageViews++
	if isNewVisitor {
		stat.UniqueVisits++
	}

	cleanPath := strings.ToLower(strings.TrimSpace(path))
	if strings.Contains(cleanPath, "/sporsher-") {
		stat.BookPageViews++
	} else {
		stat.StoryReads++
	}

	r.state.TrafficByDate[dateKey] = stat

	// Increment individual story view count if storyID/slug was provided
	if storyID != "" {
		for i, st := range r.state.Stories {
			if st.ID == storyID || st.Slug == storyID {
				st.ViewsCount++
				r.state.Stories[i] = st
				break
			}
		}
	}

	_ = r.saveLocked()
}

func (r *Repository) GetTrafficStatsBetween(startDate, endDate string) ([]models.DailyTrafficStat, []models.TopStoryStat) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var timeline []models.DailyTrafficStat
	for dateKey, stat := range r.state.TrafficByDate {
		if dateKey >= startDate && dateKey <= endDate {
			timeline = append(timeline, stat)
		}
	}

	sort.Slice(timeline, func(i, j int) bool {
		return timeline[i].Date < timeline[j].Date
	})

	var topStories []models.TopStoryStat
	for _, st := range r.state.Stories {
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

