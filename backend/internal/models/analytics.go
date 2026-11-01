package models

type DailyTrafficStat struct {
	Date          string `json:"date"`          // YYYY-MM-DD
	LabelBn       string `json:"labelBn"`       // e.g. "১ নভেম্বর"
	PageViews     int    `json:"pageViews"`     // Total page views
	UniqueVisits  int    `json:"uniqueVisits"`  // Unique IP/session visitors
	StoryReads    int    `json:"storyReads"`    // Blog/story/confession views
	BookPageViews int    `json:"bookPageViews"` // /sporsher-byakoron views
	BookOrders    int    `json:"bookOrders"`    // Paid book orders on that day
	RevenueBdt    int    `json:"revenueBdt"`    // Revenue in BDT
}

type TopStoryStat struct {
	ID         string `json:"id"`
	Slug       string `json:"slug"`
	Title      string `json:"title"`
	Category   string `json:"category"`
	ViewsCount int    `json:"viewsCount"`
	LikesCount int    `json:"likesCount"`
}

type AnalyticsSummary struct {
	Period        string             `json:"period"` // "daily" | "7d" | "monthly" | "yearly" | "custom"
	StartDate     string             `json:"startDate"`
	EndDate       string             `json:"endDate"`
	TotalViews    int                `json:"totalViews"`
	UniqueVisits  int                `json:"uniqueVisits"`
	StoryReads    int                `json:"storyReads"`
	BookPageViews int                `json:"bookPageViews"`
	TotalOrders   int                `json:"totalOrders"`
	TotalRevenue  int                `json:"totalRevenue"`
	Timeline      []DailyTrafficStat `json:"timeline"`
	TopStories    []TopStoryStat     `json:"topStories"`
}

type TrackVisitRequest struct {
	Path    string `json:"path"`    // e.g. "/", "/blog/...", "/sporsher-byakoron"
	StoryID string `json:"storyId"` // optional story ID or slug
}

