package config

import (
	"os"
	"strings"
)

type Config struct {
	Port               string
	DatabaseURL        string
	AdminPassword      string
	AdminTokenSecret   string
	InternalSecret     string
	CorsAllowedOrigins []string
	Environment        string // "production" or "development"
}

func Load() *Config {
	loadDotEnv(".env")

	originsRaw := getEnv(
		"CORS_ALLOWED_ORIGINS",
		"http://localhost:3000,https://onuvuti.site,https://www.onuvuti.site",
	)

	var origins []string
	for _, o := range strings.Split(originsRaw, ",") {
		if trimmed := strings.TrimSpace(o); trimmed != "" {
			origins = append(origins, trimmed)
		}
	}

	envMode := strings.ToLower(getEnv("APP_ENV", getEnv("NODE_ENV", "production")))

	defaultDB := strings.TrimSpace(os.Getenv("DATABASE_URL"))

	return &Config{
		Port:               getEnv("PORT", "8081"),
		DatabaseURL:        defaultDB,
		AdminPassword:      getEnv("ADMIN_PASSWORD", ""),
		AdminTokenSecret:   getEnv("ADMIN_TOKEN_SECRET", ""),
		InternalSecret:     getEnv("INTERNAL_SERVICE_SECRET", ""),
		CorsAllowedOrigins: origins,
		Environment:        envMode,
	}
}
