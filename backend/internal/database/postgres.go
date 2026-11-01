package database

import (
	"database/sql"
	"log"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

func ConnectPostgres(databaseURL string) *sql.DB {
	if strings.TrimSpace(databaseURL) == "" {
		return nil
	}

	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		log.Printf("⚠️ PostgreSQL open error: %v", err)
		return nil
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		log.Printf("⚠️ PostgreSQL unreachable (%v) — using local persistent fallback", err)
		_ = db.Close()
		return nil
	}

	if err := RunMigrations(db); err != nil {
		log.Printf("⚠️ PostgreSQL migration error: %v", err)
		_ = db.Close()
		return nil
	}

	log.Printf("✅ Connected to PostgreSQL database with auto-migrated schema")
	return db
}

