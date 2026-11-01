package repository

import (
	"database/sql"
	"fmt"
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
	if db == nil {
		return nil, fmt.Errorf("PostgreSQL connection is required in production")
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("PostgreSQL is not available: %w", err)
	}

	if err := database.SeedPostgresIfEmpty(db); err != nil {
		return nil, fmt.Errorf("PostgreSQL seed initialization failed: %w", err)
	}

	r := &Repository{
		db: db,
		mem: memoryFallbackState{
			Stories:           database.InitialStories(),
			Comments:          make(map[string][]models.Comment),
			TrafficByDate:     make(map[string]models.DailyTrafficStat),
			ConfessionCounter: 104,
		},
	}

	return r, nil
}

func (r *Repository) DB() *sql.DB {
	return r.db
}

func (r *Repository) IsPostgresConnected() bool {
	return r.db != nil && r.db.Ping() == nil
}
