package database

import (
	"database/sql"
	"log"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

func ConnectPostgres(databaseURL string) *sql.DB {
	cleanURL := strings.TrimSpace(databaseURL)
	if cleanURL == "" {
		log.Printf("⚠️ No DATABASE_URL provided — running without PostgreSQL")
		return nil
	}

	db, err := sql.Open("postgres", cleanURL)
	if err != nil {
		log.Printf("⚠️ PostgreSQL open error: %v", err)
		return nil
	}

	// Production connection pool tuning for AWS RDS / Cloud PostgreSQL
	db.SetMaxOpenConns(30)
	db.SetMaxIdleConns(15)
	db.SetConnMaxLifetime(15 * time.Minute)
	db.SetConnMaxIdleTime(5 * time.Minute)

	// Connection retry logic on container startup (e.g. AWS ECS / App Runner)
	var pingErr error
	for attempts := 1; attempts <= 5; attempts++ {
		pingErr = db.Ping()
		if pingErr == nil {
			break
		}
		log.Printf("⏳ Waiting for PostgreSQL connection (attempt %d/5): %v", attempts, pingErr)
		time.Sleep(time.Duration(attempts) * time.Second)
	}

	if pingErr != nil {
		log.Printf("⚠️ PostgreSQL unreachable (%v)", pingErr)
		_ = db.Close()
		return nil
	}

	if err := RunMigrations(db); err != nil {
		log.Printf("⚠️ PostgreSQL migration error: %v", err)
		_ = db.Close()
		return nil
	}

	log.Printf("✅ Connected to PostgreSQL database with auto-migrated schema (Production Pool Active)")
	return db
}
