package database

import (
	"database/sql"

	"github.com/onuvuti/backend/internal/models"
)

// InitialStories returns an empty slice for clean production.
// All published and pending stories are created dynamically by the admin and users.
func InitialStories() []models.Story {
	return []models.Story{}
}

// InitialDailyTraffic returns an empty map for production. Genuine real-time visitors populate daily_traffic.
func InitialDailyTraffic() map[string]models.DailyTrafficStat {
	return make(map[string]models.DailyTrafficStat)
}

func SeedPostgresIfEmpty(db *sql.DB) error {
	// In production, no hardcoded or fabricated stories/orders/traffic are seeded.
	// PostgreSQL remains clean and driven 100% by live admin/user activity.
	return nil
}
