package repository

import (
	"database/sql"
	"log"
	"sync"

	"github.com/onuvuti/backend/internal/database"
	"github.com/onuvuti/backend/internal/models"
)

type memoryFallbackState struct {
	Stories           []models.Story
	Users             []models.User
	Comments          map[string][]models.Comment
	Orders            []models.BookOrder
	TrafficByDate     map[string]models.DailyTrafficStat
	ConfessionCounter int
}

type Repository struct {
	mu  sync.RWMutex
	db  *sql.DB
	mem memoryFallbackState
}

func NewRepository(db *sql.DB) (*Repository, error) {
	r := &Repository{
		db: db,
		mem: memoryFallbackState{
			Stories:           database.InitialStories(),
			Comments:          make(map[string][]models.Comment),
			TrafficByDate:     database.InitialDailyTraffic(),
			ConfessionCounter: 104,
		},
	}

	if r.db != nil {
		if err := database.SeedPostgresIfEmpty(r.db); err != nil {
			log.Printf("⚠️ Postgres auto-seed error: %v", err)
		}
	}

	return r, nil
}

func (r *Repository) DB() *sql.DB {
	return r.db
}

func (r *Repository) IsPostgresConnected() bool {
	return r.db != nil && r.db.Ping() == nil
}
