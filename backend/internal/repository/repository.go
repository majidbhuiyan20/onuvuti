package repository

import (
	"database/sql"
	"encoding/json"
	"os"
	"path/filepath"
	"sync"

	"github.com/onuvuti/backend/internal/database"
	"github.com/onuvuti/backend/internal/models"
)

type persistedState struct {
	Stories           []models.Story                     `json:"stories"`
	Users             []models.User                      `json:"users"`
	Comments          map[string][]models.Comment        `json:"comments"`
	Orders            []models.BookOrder                 `json:"orders"`
	TrafficByDate     map[string]models.DailyTrafficStat `json:"trafficByDate"`
	ConfessionCounter int                                `json:"confessionCounter"`
}

type Repository struct {
	mu       sync.RWMutex
	filePath string
	pg       *sql.DB
	state    persistedState
}

func NewRepository(filePath string, pg *sql.DB) (*Repository, error) {
	r := &Repository{
		filePath: filePath,
		pg:       pg,
		state: persistedState{
			Comments:          make(map[string][]models.Comment),
			TrafficByDate:     make(map[string]models.DailyTrafficStat),
			ConfessionCounter: 104,
		},
	}

	if err := os.MkdirAll(filepath.Dir(filePath), 0755); err != nil {
		return nil, err
	}

	if err := r.loadFromFile(); err != nil {
		r.state.Stories = database.InitialStories()
		r.state.TrafficByDate = database.InitialDailyTraffic()
		_ = r.saveLocked()
	}

	if len(r.state.TrafficByDate) == 0 {
		r.state.TrafficByDate = database.InitialDailyTraffic()
		_ = r.saveLocked()
	}

	if r.pg != nil {
		r.syncInitialWithPostgres()
	}

	return r, nil
}

func (r *Repository) IsPostgresConnected() bool {
	return r.pg != nil
}

func (r *Repository) loadFromFile() error {
	raw, err := os.ReadFile(r.filePath)
	if err != nil {
		return err
	}
	var loaded persistedState
	if err := json.Unmarshal(raw, &loaded); err != nil {
		return err
	}
	if loaded.Comments == nil {
		loaded.Comments = make(map[string][]models.Comment)
	}
	if loaded.TrafficByDate == nil {
		loaded.TrafficByDate = database.InitialDailyTraffic()
	}
	if loaded.ConfessionCounter < 104 {
		loaded.ConfessionCounter = 104
	}
	r.state = loaded
	return nil
}

func (r *Repository) saveLocked() error {
	raw, err := json.MarshalIndent(r.state, "", "  ")
	if err != nil {
		return err
	}
	tmp := r.filePath + ".tmp"
	if err := os.WriteFile(tmp, raw, 0644); err != nil {
		return err
	}
	return os.Rename(tmp, r.filePath)
}

func (r *Repository) syncInitialWithPostgres() {
	var count int
	if err := r.pg.QueryRow(`SELECT COUNT(*) FROM stories`).Scan(&count); err != nil {
		return
	}
	if count == 0 {
		for _, st := range r.state.Stories {
			r.upsertStoryPostgres(st)
		}
	}
}

