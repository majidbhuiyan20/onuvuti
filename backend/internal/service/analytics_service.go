package service

import (
	"strings"
	"sync"
	"time"

	"github.com/onuvuti/backend/internal/middleware"
	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/repository"
)

type AnalyticsService struct {
	repo          *repository.Repository
	visitorMu     sync.Mutex
	seenIPByDay   map[string]bool
}

func NewAnalyticsService(repo *repository.Repository) *AnalyticsService {
	return &AnalyticsService{
		repo:        repo,
		seenIPByDay: make(map[string]bool),
	}
}

func (s *AnalyticsService) TrackVisit(clientIP, path, storyID string) {
	// Guard against developer/admin IPs and admin paths
	if middleware.IsDeveloperIP(clientIP) || strings.HasPrefix(strings.ToLower(strings.TrimSpace(path)), "/admin") {
		return
	}

	today := time.Now().Format("2006-01-02")
	visitorKey := today + ":" + clientIP

	s.visitorMu.Lock()
	isNewVisitor := !s.seenIPByDay[visitorKey]
	if isNewVisitor {
		s.seenIPByDay[visitorKey] = true
	}
	s.visitorMu.Unlock()

	s.repo.RecordVisit(path, storyID, isNewVisitor)
}

// GetSummary returns aggregated traffic & revenue analytics for:
// - "daily" (Today)
// - "7d" (Last 7 days)
// - "monthly" (Last 30 days)
// - "yearly" (Last 365 days)
// - "custom" (startDate to endDate YYYY-MM-DD)
func (s *AnalyticsService) GetSummary(period, startDate, endDate string) models.AnalyticsSummary {
	now := time.Now()
	p := strings.ToLower(strings.TrimSpace(period))
	if p == "" {
		p = "7d"
	}

	var startStr, endStr string
	endStr = now.Format("2006-01-02")

	switch p {
	case "daily", "today":
		p = "daily"
		startStr = endStr
	case "7d", "weekly":
		p = "7d"
		startStr = now.AddDate(0, 0, -6).Format("2006-01-02")
	case "monthly", "30d":
		p = "monthly"
		startStr = now.AddDate(0, 0, -29).Format("2006-01-02")
	case "yearly", "365d":
		p = "yearly"
		startStr = now.AddDate(0, 0, -364).Format("2006-01-02")
	case "custom":
		if strings.TrimSpace(startDate) != "" {
			startStr = strings.TrimSpace(startDate)
		} else {
			startStr = now.AddDate(0, 0, -6).Format("2006-01-02")
		}
		if strings.TrimSpace(endDate) != "" {
			endStr = strings.TrimSpace(endDate)
		}
		if startStr > endStr {
			startStr, endStr = endStr, startStr
		}
	default:
		p = "7d"
		startStr = now.AddDate(0, 0, -6).Format("2006-01-02")
	}

	timeline, topStories := s.repo.GetTrafficStatsBetween(startStr, endStr)

	summary := models.AnalyticsSummary{
		Period:     p,
		StartDate:  startStr,
		EndDate:    endStr,
		Timeline:   timeline,
		TopStories: topStories,
	}

	for _, day := range timeline {
		summary.TotalViews += day.PageViews
		summary.UniqueVisits += day.UniqueVisits
		summary.StoryReads += day.StoryReads
		summary.BookPageViews += day.BookPageViews
		summary.TotalOrders += day.BookOrders
		summary.TotalRevenue += day.RevenueBdt
	}

	if summary.Timeline == nil {
		summary.Timeline = []models.DailyTrafficStat{}
	}
	if summary.TopStories == nil {
		summary.TopStories = []models.TopStoryStat{}
	}

	return summary
}

