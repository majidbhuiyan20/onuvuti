package main

import (
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	_ "github.com/lib/pq"
	"github.com/onuvuti/backend/internal/database"
)

type JsonOrder struct {
	OrderID       string `json:"orderId"`
	InvoiceID     string `json:"invoiceId"`
	TransactionID string `json:"transactionId"`
	CusName       string `json:"cusName"`
	CusEmail      string `json:"cusEmail"`
	CusPhone      string `json:"cusPhone"`
	Amount        int    `json:"amount"`
	Currency      string `json:"currency"`
	Status        string `json:"status"`
	PaymentMethod string `json:"paymentMethod"`
	DownloadToken string `json:"downloadToken"`
	DownloadCount int    `json:"downloadCount"`
	CreatedAt     string `json:"createdAt"`
	VerifiedAt    string `json:"verifiedAt"`
}

func isTestOrder(o JsonOrder) bool {
	id := strings.ToUpper(strings.TrimSpace(o.OrderID))
	email := strings.ToLower(strings.TrimSpace(o.CusEmail))
	if strings.HasPrefix(id, "TEST-") || strings.HasPrefix(id, "DEMO-") || strings.HasPrefix(id, "ONV-TEST") {
		return true
	}
	if email == "test@example.com" || email == "buyer@example.com" || email == "buyer1@example.com" || email == "test@test.com" {
		return true
	}
	return false
}

func main() {
	filePath := flag.String("file", "../storage/orders.json", "Path to orders.json file")
	dbURL := flag.String("db", "", "PostgreSQL database connection URL (or DATABASE_URL env)")
	skipTests := flag.Bool("skip-tests", true, "Skip test/demo orders from importing into production")
	flag.Parse()

	connStr := *dbURL
	if connStr == "" {
		connStr = os.Getenv("DATABASE_URL")
	}
	if connStr == "" {
		log.Fatal("❌ DATABASE_URL is not set. Please provide via -db or set DATABASE_URL environment variable.")
	}

	cleanPath, err := filepath.Abs(*filePath)
	if err != nil {
		log.Fatalf("❌ Invalid file path: %v", err)
	}

	data, err := os.ReadFile(cleanPath)
	if err != nil {
		log.Fatalf("❌ Failed to read orders file %s: %v", cleanPath, err)
	}

	var orders []JsonOrder
	if err := json.Unmarshal(data, &orders); err != nil {
		log.Fatalf("❌ Failed to parse JSON orders: %v", err)
	}

	fmt.Printf("🔍 Analyzing %d orders from %s\n", len(orders), cleanPath)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("❌ Database connection error: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("❌ Failed to ping database: %v", err)
	}

	// Ensure schema exists first
	if err := database.RunMigrations(db); err != nil {
		log.Fatalf("❌ Schema migration failed: %v", err)
	}

	tx, err := db.Begin()
	if err != nil {
		log.Fatalf("❌ Failed to start transaction: %v", err)
	}
	defer tx.Rollback()

	checkStmt, err := tx.Prepare(`SELECT status FROM book_orders WHERE order_id = $1`)
	if err != nil {
		log.Fatalf("❌ Failed to prepare check statement: %v", err)
	}
	defer checkStmt.Close()

	stmt, err := tx.Prepare(`
		INSERT INTO book_orders (
			order_id, invoice_id, cus_name, cus_phone, cus_email,
			amount, currency, transaction_id, payment_method, status,
			download_token, download_count, created_at, verified_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
		ON CONFLICT (order_id) DO UPDATE SET
			status = CASE WHEN book_orders.status = 'PAID' THEN 'PAID' ELSE EXCLUDED.status END,
			invoice_id = CASE WHEN EXCLUDED.invoice_id != '' THEN EXCLUDED.invoice_id ELSE book_orders.invoice_id END,
			transaction_id = CASE WHEN EXCLUDED.transaction_id != '' THEN EXCLUDED.transaction_id ELSE book_orders.transaction_id END,
			payment_method = CASE WHEN EXCLUDED.payment_method != '' THEN EXCLUDED.payment_method ELSE book_orders.payment_method END,
			download_token = CASE WHEN EXCLUDED.download_token != '' THEN EXCLUDED.download_token ELSE book_orders.download_token END,
			download_count = GREATEST(book_orders.download_count, EXCLUDED.download_count),
			verified_at = CASE WHEN EXCLUDED.verified_at IS NOT NULL THEN EXCLUDED.verified_at ELSE book_orders.verified_at END
	`)
	if err != nil {
		log.Fatalf("❌ Failed to prepare insert statement: %v", err)
	}
	defer stmt.Close()

	newImported := 0
	alreadyExisting := 0
	skippedTests := 0

	for _, o := range orders {
		orderID := strings.TrimSpace(o.OrderID)
		if orderID == "" {
			continue
		}

		if *skipTests && isTestOrder(o) {
			skippedTests++
			continue
		}

		// Check if already exists in database
		var existingStatus string
		err := checkStmt.QueryRow(orderID).Scan(&existingStatus)
		isExisting := err == nil

		createdAt := time.Now()
		if o.CreatedAt != "" {
			if t, err := time.Parse(time.RFC3339, o.CreatedAt); err == nil {
				createdAt = t
			}
		}

		var verifiedAt sql.NullTime
		if o.VerifiedAt != "" {
			if t, err := time.Parse(time.RFC3339, o.VerifiedAt); err == nil {
				verifiedAt = sql.NullTime{Time: t, Valid: true}
			}
		}

		currency := o.Currency
		if currency == "" {
			currency = "BDT"
		}

		amount := o.Amount
		if amount <= 0 {
			amount = 99
		}

		status := strings.ToUpper(strings.TrimSpace(o.Status))
		if status == "" {
			status = "PENDING"
		}

		cusName := strings.TrimSpace(o.CusName)
		if cusName == "" {
			cusName = "সম্মানিত পাঠক"
		}

		_, err = stmt.Exec(
			orderID,
			strings.TrimSpace(o.InvoiceID),
			cusName,
			strings.TrimSpace(o.CusPhone),
			strings.TrimSpace(o.CusEmail),
			amount,
			currency,
			strings.TrimSpace(o.TransactionID),
			strings.TrimSpace(o.PaymentMethod),
			status,
			strings.TrimSpace(o.DownloadToken),
			o.DownloadCount,
			createdAt,
			verifiedAt,
		)
		if err != nil {
			// Abort and rollback immediately if any real order fails
			log.Fatalf("❌ Migration ABORTED & ROLLED BACK. Error inserting order %s: %v", orderID, err)
		}

		if isExisting {
			alreadyExisting++
		} else {
			newImported++
		}
	}

	if err := tx.Commit(); err != nil {
		log.Fatalf("❌ Failed to commit migration transaction: %v", err)
	}

	fmt.Println("==================================================")
	fmt.Println("🎉 ORDER MIGRATION COMPLETED SUCCESSFULLY")
	fmt.Println("==================================================")
	fmt.Printf("Total Records in File:   %d\n", len(orders))
	fmt.Printf("Newly Imported Orders:   %d\n", newImported)
	fmt.Printf("Preserved/Updated:       %d\n", alreadyExisting)
	fmt.Printf("Skipped Test Records:    %d\n", skippedTests)
	fmt.Printf("Failed Records:          0\n")
	fmt.Println("PostgreSQL is now the 100% authoritative order database.")
	fmt.Println("==================================================")
}
