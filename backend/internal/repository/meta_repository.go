package repository

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/onuvuti/backend/internal/models"
)

// GetMetaPixelSettings retrieves settings and the access token from DB.
func (r *Repository) GetMetaPixelSettings() (*models.MetaPixelSettings, string, error) {
	if r.db == nil {
		return &models.MetaPixelSettings{
			PixelID:                "4121296221505373",
			IsEnabled:              true,
			BrowserTrackingEnabled: true,
			CAPIEnabled:            true,
			TestEventCode:          "",
			HasAccessToken:         false,
			UpdatedAt:              time.Now(),
		}, "", nil
	}

	var s models.MetaPixelSettings
	var rawToken string

	err := r.db.QueryRow(`
		SELECT pixel_id, is_enabled, browser_tracking_enabled, capi_enabled, test_event_code, access_token, updated_at
		FROM meta_pixel_settings
		WHERE id = 'default'
	`).Scan(&s.PixelID, &s.IsEnabled, &s.BrowserTrackingEnabled, &s.CAPIEnabled, &s.TestEventCode, &rawToken, &s.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			// Seed row if missing
			return &models.MetaPixelSettings{
				PixelID:                "4121296221505373",
				IsEnabled:              true,
				BrowserTrackingEnabled: true,
				CAPIEnabled:            true,
				TestEventCode:          "",
				HasAccessToken:         false,
				UpdatedAt:              time.Now(),
			}, "", nil
		}
		return nil, "", fmt.Errorf("failed to read meta_pixel_settings: %w", err)
	}

	s.HasAccessToken = strings.TrimSpace(rawToken) != ""
	return &s, rawToken, nil
}

// UpdateMetaPixelSettings updates configuration in PostgreSQL.
func (r *Repository) UpdateMetaPixelSettings(s models.MetaPixelSettings, newAccessToken string) error {
	if r.db == nil {
		return nil
	}

	cleanPixelID := strings.TrimSpace(s.PixelID)
	if cleanPixelID == "" {
		cleanPixelID = "4121296221505373"
	}
	cleanTestCode := strings.TrimSpace(s.TestEventCode)
	now := time.Now()

	var err error
	if strings.TrimSpace(newAccessToken) != "" {
		_, err = r.db.Exec(`
			INSERT INTO meta_pixel_settings (id, pixel_id, is_enabled, browser_tracking_enabled, capi_enabled, test_event_code, access_token, updated_at)
			VALUES ('default', $1, $2, $3, $4, $5, $6, $7)
			ON CONFLICT (id) DO UPDATE SET
				pixel_id = EXCLUDED.pixel_id,
				is_enabled = EXCLUDED.is_enabled,
				browser_tracking_enabled = EXCLUDED.browser_tracking_enabled,
				capi_enabled = EXCLUDED.capi_enabled,
				test_event_code = EXCLUDED.test_event_code,
				access_token = EXCLUDED.access_token,
				updated_at = EXCLUDED.updated_at
		`, cleanPixelID, s.IsEnabled, s.BrowserTrackingEnabled, s.CAPIEnabled, cleanTestCode, strings.TrimSpace(newAccessToken), now)
	} else {
		_, err = r.db.Exec(`
			INSERT INTO meta_pixel_settings (id, pixel_id, is_enabled, browser_tracking_enabled, capi_enabled, test_event_code, updated_at)
			VALUES ('default', $1, $2, $3, $4, $5, $6)
			ON CONFLICT (id) DO UPDATE SET
				pixel_id = EXCLUDED.pixel_id,
				is_enabled = EXCLUDED.is_enabled,
				browser_tracking_enabled = EXCLUDED.browser_tracking_enabled,
				capi_enabled = EXCLUDED.capi_enabled,
				test_event_code = EXCLUDED.test_event_code,
				updated_at = EXCLUDED.updated_at
		`, cleanPixelID, s.IsEnabled, s.BrowserTrackingEnabled, s.CAPIEnabled, cleanTestCode, now)
	}

	return err
}

// RecordMetaEvent writes an internal event log entry.
func (r *Repository) RecordMetaEvent(log models.MetaEventLog) error {
	if r.db == nil {
		return nil
	}

	currency := strings.TrimSpace(log.Currency)
	if currency == "" {
		currency = "BDT"
	}

	source := strings.TrimSpace(log.Source)
	if source == "" {
		source = "browser"
	}

	status := strings.TrimSpace(log.Status)
	if status == "" {
		status = "received"
	}

	_, err := r.db.Exec(`
		INSERT INTO meta_event_logs (event_name, event_id, source, status, order_id, value_bdt, currency, payload_json, error_message, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
	`, log.EventName, strings.TrimSpace(log.EventID), source, status, strings.TrimSpace(log.OrderID), log.ValueBDT, currency, strings.TrimSpace(log.PayloadJSON), strings.TrimSpace(log.ErrorMessage), time.Now())

	return err
}

// RecordMetaPurchaseEvent inserts or updates the purchase event record.
func (r *Repository) RecordMetaPurchaseEvent(p models.MetaPurchaseEvent) error {
	if r.db == nil {
		return nil
	}

	currency := strings.TrimSpace(p.Currency)
	if currency == "" {
		currency = "BDT"
	}
	serverStatus := strings.TrimSpace(p.ServerStatus)
	if serverStatus == "" {
		serverStatus = "pending"
	}

	_, err := r.db.Exec(`
		INSERT INTO meta_purchase_events (order_id, event_id, amount_bdt, currency, browser_sent, server_sent, server_status, server_response, server_sent_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
		ON CONFLICT (order_id) DO UPDATE SET
			event_id = CASE WHEN meta_purchase_events.event_id = '' THEN EXCLUDED.event_id ELSE meta_purchase_events.event_id END,
			amount_bdt = EXCLUDED.amount_bdt,
			currency = EXCLUDED.currency
	`, strings.TrimSpace(p.OrderID), strings.TrimSpace(p.EventID), p.AmountBDT, currency, p.BrowserSent, p.ServerSent, serverStatus, p.ServerResponse, p.ServerSentAt)

	return err
}

// UpdateMetaPurchaseServerStatus updates the server delivery outcome.
func (r *Repository) UpdateMetaPurchaseServerStatus(orderID, status, response string, sent bool) error {
	if r.db == nil {
		return nil
	}

	now := time.Now()
	_, err := r.db.Exec(`
		UPDATE meta_purchase_events
		SET server_status = $2,
			server_response = $3,
			server_sent = $4,
			server_sent_at = $5
		WHERE order_id = $1
	`, strings.TrimSpace(orderID), status, response, sent, now)

	return err
}

// MarkMetaPurchaseBrowserSent sets browser_sent to true for the given order ID.
func (r *Repository) MarkMetaPurchaseBrowserSent(orderID string) error {
	if r.db == nil {
		return nil
	}

	cleanID := strings.TrimSpace(orderID)
	eventID := "purchase_" + cleanID

	_, err := r.db.Exec(`
		INSERT INTO meta_purchase_events (order_id, event_id, amount_bdt, currency, browser_sent, created_at)
		VALUES ($1, $2, 0, 'BDT', TRUE, NOW())
		ON CONFLICT (order_id) DO UPDATE SET
			browser_sent = TRUE
	`, cleanID, eventID)

	return err
}

// GetMetaEventsSummary aggregates summary metrics for key Meta events.
func (r *Repository) GetMetaEventsSummary() ([]models.MetaEventSummary, error) {
	eventsList := []struct {
		Name string
		Desc string
	}{
		{"PageView", "ওয়েবসাইট পেজ ভিজিট"},
		{"ViewContent", "ই-বুক / প্রোডাক্ট ভিউ"},
		{"InitiateCheckout", "চেকআউট শুরু"},
		{"Purchase", "ভেরিফাইড পেমেন্ট ও সফল অর্ডার"},
		{"CompleteRegistration", "একাউন্ট নিবন্ধন সম্পন্ন"},
		{"Lead", "পাঠকের গল্প / লেখা সাবমিশন"},
	}

	var summaries []models.MetaEventSummary

	if r.db == nil {
		for _, e := range eventsList {
			summaries = append(summaries, models.MetaEventSummary{
				EventName:   e.Name,
				Description: e.Desc,
				Status:      "active",
				Count:       0,
				Source:      "browser",
			})
		}
		return summaries, nil
	}

	for _, e := range eventsList {
		var count int
		var lastTime sql.NullTime
		var lastStatus sql.NullString
		var source sql.NullString
		var recentRef sql.NullString

		err := r.db.QueryRow(`
			SELECT COUNT(*), MAX(created_at)
			FROM meta_event_logs
			WHERE event_name = $1
		`, e.Name).Scan(&count, &lastTime)

		if err != nil {
			count = 0
		}

		if count > 0 {
			_ = r.db.QueryRow(`
				SELECT status, source, order_id
				FROM meta_event_logs
				WHERE event_name = $1
				ORDER BY created_at DESC
				LIMIT 1
			`, e.Name).Scan(&lastStatus, &source, &recentRef)
		}

		statusStr := "active"
		if count == 0 {
			statusStr = "standby"
		} else if lastStatus.Valid && lastStatus.String == "failed" {
			statusStr = "error"
		}

		srcStr := "browser"
		if e.Name == "Purchase" {
			srcStr = "browser & server"
		} else if source.Valid && source.String != "" {
			srcStr = source.String
		}

		item := models.MetaEventSummary{
			EventName:   e.Name,
			Description: e.Desc,
			Status:      statusStr,
			Count:       count,
			Source:      srcStr,
		}
		if lastTime.Valid {
			item.LastTriggeredAt = &lastTime.Time
		}
		if recentRef.Valid && recentRef.String != "" {
			item.RecentRef = recentRef.String
		}

		summaries = append(summaries, item)
	}

	return summaries, nil
}

// GetRecentMetaLogs retrieves the latest internal event logs.
func (r *Repository) GetRecentMetaLogs(limit int) ([]models.MetaEventLog, error) {
	if r.db == nil {
		return []models.MetaEventLog{}, nil
	}

	if limit <= 0 || limit > 200 {
		limit = 50
	}

	rows, err := r.db.Query(`
		SELECT id, event_name, event_id, source, status, COALESCE(order_id, ''), value_bdt, currency, COALESCE(payload_json::text, '{}'), COALESCE(error_message, ''), created_at
		FROM meta_event_logs
		ORDER BY created_at DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch meta logs: %w", err)
	}
	defer rows.Close()

	var logs []models.MetaEventLog
	for rows.Next() {
		var l models.MetaEventLog
		if err := rows.Scan(
			&l.ID,
			&l.EventName,
			&l.EventID,
			&l.Source,
			&l.Status,
			&l.OrderID,
			&l.ValueBDT,
			&l.Currency,
			&l.PayloadJSON,
			&l.ErrorMessage,
			&l.CreatedAt,
		); err != nil {
			continue
		}
		logs = append(logs, l)
	}

	return logs, nil
}

// GetMetaPurchaseAnalytics computes complete verified purchase analytics.
func (r *Repository) GetMetaPurchaseAnalytics() (*models.MetaPurchaseAnalytics, error) {
	analytics := &models.MetaPurchaseAnalytics{
		EbookSales:      []models.MetaEbookSale{},
		RecentPurchases: []models.MetaRecentPurchase{},
		DailySales:      []models.MetaSalesTrend{},
		MonthlySales:    []models.MetaSalesTrend{},
	}

	if r.db == nil {
		return analytics, nil
	}

	// 1. Total verified purchases & total revenue from book_orders
	var totalPurchases int
	var totalRevenue sql.NullFloat64
	err := r.db.QueryRow(`
		SELECT COUNT(*), SUM(amount)
		FROM book_orders
		WHERE status = 'PAID'
	`).Scan(&totalPurchases, &totalRevenue)
	if err == nil {
		analytics.TotalVerifiedPurchases = totalPurchases
		if totalRevenue.Valid {
			analytics.TotalRevenueBDT = totalRevenue.Float64
		}
	}

	// 2. eBook-wise sales
	analytics.EbookSales = append(analytics.EbookSales, models.MetaEbookSale{
		Title:      "স্পর্শের ব্যাকরণ (ই-বুক)",
		UnitsSold:  analytics.TotalVerifiedPurchases,
		RevenueBDT: analytics.TotalRevenueBDT,
	})

	// 3. Recent purchases with Meta CAPI delivery status
	recentRows, err := r.db.Query(`
		SELECT 
			o.order_id, 
			o.cus_name, 
			o.amount, 
			COALESCE(m.browser_sent, FALSE),
			COALESCE(m.server_sent, FALSE),
			COALESCE(m.server_status, 'pending'),
			COALESCE(o.verified_at, o.created_at)
		FROM book_orders o
		LEFT JOIN meta_purchase_events m ON o.order_id = m.order_id
		WHERE o.status = 'PAID'
		ORDER BY COALESCE(o.verified_at, o.created_at) DESC
		LIMIT 15
	`)
	if err == nil {
		defer recentRows.Close()
		for recentRows.Next() {
			var p models.MetaRecentPurchase
			if err := recentRows.Scan(
				&p.OrderID,
				&p.CustomerName,
				&p.AmountBDT,
				&p.BrowserSent,
				&p.ServerSent,
				&p.ServerStatus,
				&p.VerifiedAt,
			); err == nil {
				analytics.RecentPurchases = append(analytics.RecentPurchases, p)
			}
		}
	}

	// 4. Daily sales summary (last 14 days)
	dailyRows, err := r.db.Query(`
		SELECT 
			TO_CHAR(COALESCE(verified_at, created_at), 'YYYY-MM-DD') AS date_key,
			COUNT(*) AS purchases_count,
			COALESCE(SUM(amount), 0) AS revenue_bdt
		FROM book_orders
		WHERE status = 'PAID' AND COALESCE(verified_at, created_at) >= NOW() - INTERVAL '14 days'
		GROUP BY date_key
		ORDER BY date_key DESC
	`)
	if err == nil {
		defer dailyRows.Close()
		for dailyRows.Next() {
			var d models.MetaSalesTrend
			if err := dailyRows.Scan(&d.DateKey, &d.PurchasesCount, &d.RevenueBDT); err == nil {
				d.Label = d.DateKey
				analytics.DailySales = append(analytics.DailySales, d)
			}
		}
	}

	// 5. Monthly sales summary (last 12 months)
	monthlyRows, err := r.db.Query(`
		SELECT 
			TO_CHAR(COALESCE(verified_at, created_at), 'YYYY-MM') AS month_key,
			COUNT(*) AS purchases_count,
			COALESCE(SUM(amount), 0) AS revenue_bdt
		FROM book_orders
		WHERE status = 'PAID' AND COALESCE(verified_at, created_at) >= NOW() - INTERVAL '12 months'
		GROUP BY month_key
		ORDER BY month_key DESC
	`)
	if err == nil {
		defer monthlyRows.Close()
		for monthlyRows.Next() {
			var m models.MetaSalesTrend
			if err := monthlyRows.Scan(&m.DateKey, &m.PurchasesCount, &m.RevenueBDT); err == nil {
				m.Label = m.DateKey
				analytics.MonthlySales = append(analytics.MonthlySales, m)
			}
		}
	}

	// 6. Meta Purchase Delivery Status
	var serverSent, browserSent, deduplicated, failed, pending int
	_ = r.db.QueryRow(`
		SELECT 
			COUNT(*) FILTER (WHERE server_sent = TRUE),
			COUNT(*) FILTER (WHERE browser_sent = TRUE),
			COUNT(*) FILTER (WHERE server_sent = TRUE AND browser_sent = TRUE),
			COUNT(*) FILTER (WHERE server_status = 'failed'),
			COUNT(*) FILTER (WHERE server_status = 'pending')
		FROM meta_purchase_events
	`).Scan(&serverSent, &browserSent, &deduplicated, &failed, &pending)

	deliveryPct := 0.0
	if analytics.TotalVerifiedPurchases > 0 {
		delivered := serverSent
		if browserSent > delivered {
			delivered = browserSent
		}
		deliveryPct = (float64(delivered) / float64(analytics.TotalVerifiedPurchases)) * 100.0
		if deliveryPct > 100.0 {
			deliveryPct = 100.0
		}
	}

	analytics.DeliveryStatus = models.MetaDeliveryStatus{
		TotalPurchases:     analytics.TotalVerifiedPurchases,
		ServerSentCount:    serverSent,
		BrowserSentCount:   browserSent,
		DeduplicatedCount:  deduplicated,
		FailedCount:        failed,
		PendingCount:       pending,
		DeliveryPercentage: deliveryPct,
	}

	return analytics, nil
}

