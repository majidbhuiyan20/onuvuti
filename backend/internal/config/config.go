package config

import "strings"

type Config struct {
	Port               string
	DatabaseURL        string
	AdminPassword      string
	AdminTokenSecret   string
	CorsAllowedOrigins []string
	DataFilePath       string
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

	return &Config{
		Port:               getEnv("PORT", "8081"),
		DatabaseURL:        getEnv("DATABASE_URL", ""),
		AdminPassword:      getEnv("ADMIN_PASSWORD", "onuvuti-admin-2026"),
		AdminTokenSecret:   getEnv("ADMIN_TOKEN_SECRET", "onuvuti-go-jwt-hmac-secret-2026"),
		CorsAllowedOrigins: origins,
		DataFilePath:       getEnv("DATA_FILE_PATH", "./data/onuvuti_store.json"),
	}
}
