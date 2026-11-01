package repository

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/onuvuti/backend/internal/models"
)

func scanOrderRow(row interface{ Scan(dest ...any) error }) (*models.BookOrder, error) {
	var o models.BookOrder
	var verifiedAt sql.NullTime
	var invoiceID, currency, transactionID, paymentMethod, downloadToken sql.NullString

	err := row.Scan(
		&o.OrderID,
		&invoiceID,
		&o.CusName,
		&o.CusPhone,
		&o.CusEmail,
		&o.Amount,
		&currency,
		&transactionID,
		&paymentMethod,
		&o.Status,
		&downloadToken,
		&o.DownloadCount,
		&o.CreatedAt,
		&verifiedAt,
	)
	if err != nil {
		return nil, err
	}

	o.InvoiceID = invoiceID.String
	o.Currency = currency.String
	o.TransactionID = transactionID.String
	o.PaymentMethod = paymentMethod.String
	o.DownloadToken = downloadToken.String
	if verifiedAt.Valid {
		o.VerifiedAt = &verifiedAt.Time
	}

	return &o, nil
}

func (r *Repository) ListOrders() []models.BookOrder {
	if r.db != nil {
		rows, err := r.db.Query(`
			SELECT order_id, invoice_id, cus_name, cus_phone, cus_email, amount, currency, transaction_id, payment_method, status, download_token, download_count, created_at, verified_at
			FROM book_orders
			ORDER BY created_at DESC
			LIMIT 200
		`)
		if err != nil {
			log.Printf("⚠️ PostgreSQL ListOrders error: %v", err)
			return []models.BookOrder{}
		}
		defer rows.Close()

		var out []models.BookOrder
		for rows.Next() {
			if o, err := scanOrderRow(rows); err == nil && o != nil {
				out = append(out, *o)
			}
		}
		if out == nil {
			out = []models.BookOrder{}
		}
		return out
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.mem.Orders
}

func (r *Repository) CreateOrder(order models.BookOrder) (*models.BookOrder, error) {
	if order.CreatedAt.IsZero() {
		order.CreatedAt = time.Now()
	}
	if order.Currency == "" {
		order.Currency = "BDT"
	}
	if order.Status == "" {
		order.Status = "PENDING"
	}

	if r.db != nil {
		// If transaction_id is non-empty, ensure it's not already used by another order
		if strings.TrimSpace(order.TransactionID) != "" {
			var conflictOrderID string
			err := r.db.QueryRow(`
				SELECT order_id FROM book_orders
				WHERE UPPER(transaction_id) = UPPER($1) AND order_id != $2
				LIMIT 1
			`, strings.TrimSpace(order.TransactionID), order.OrderID).Scan(&conflictOrderID)
			if err == nil && conflictOrderID != "" {
				return nil, fmt.Errorf("transaction ID %s is already attached to order %s", order.TransactionID, conflictOrderID)
			}
		}

		_, err := r.db.Exec(`
			INSERT INTO book_orders (
				order_id, invoice_id, cus_name, cus_phone, cus_email,
				amount, currency, transaction_id, payment_method, status,
				download_token, download_count, created_at, verified_at
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
			ON CONFLICT (order_id) DO UPDATE SET
				invoice_id = CASE WHEN EXCLUDED.invoice_id != '' THEN EXCLUDED.invoice_id ELSE book_orders.invoice_id END,
				status = CASE WHEN book_orders.status = 'PAID' THEN 'PAID' ELSE EXCLUDED.status END,
				transaction_id = CASE WHEN EXCLUDED.transaction_id != '' THEN EXCLUDED.transaction_id ELSE book_orders.transaction_id END,
				payment_method = CASE WHEN EXCLUDED.payment_method != '' THEN EXCLUDED.payment_method ELSE book_orders.payment_method END,
				download_token = CASE WHEN EXCLUDED.download_token != '' THEN EXCLUDED.download_token ELSE book_orders.download_token END,
				download_count = CASE WHEN EXCLUDED.download_count > book_orders.download_count THEN EXCLUDED.download_count ELSE book_orders.download_count END
		`,
			order.OrderID,
			order.InvoiceID,
			order.CusName,
			order.CusPhone,
			order.CusEmail,
			order.Amount,
			order.Currency,
			order.TransactionID,
			order.PaymentMethod,
			order.Status,
			order.DownloadToken,
			order.DownloadCount,
			order.CreatedAt,
			order.VerifiedAt,
		)
		if err != nil {
			log.Printf("⚠️ PostgreSQL CreateOrder error: %v", err)
			return nil, err
		}

		return r.FindOrderByID(order.OrderID), nil
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	for i, o := range r.mem.Orders {
		if strings.EqualFold(o.OrderID, order.OrderID) {
			if o.Status == "PAID" {
				order.Status = "PAID"
				if order.DownloadToken == "" {
					order.DownloadToken = o.DownloadToken
				}
				if order.TransactionID == "" {
					order.TransactionID = o.TransactionID
				}
			}
			r.mem.Orders[i] = order
			return &order, nil
		}
	}

	r.mem.Orders = append([]models.BookOrder{order}, r.mem.Orders...)
	return &order, nil
}

func (r *Repository) FindOrderByID(id string) *models.BookOrder {
	cleanID := strings.TrimSpace(id)
	if cleanID == "" {
		return nil
	}

	if r.db != nil {
		row := r.db.QueryRow(`
			SELECT order_id, invoice_id, cus_name, cus_phone, cus_email, amount, currency, transaction_id, payment_method, status, download_token, download_count, created_at, verified_at
			FROM book_orders
			WHERE order_id = $1 OR invoice_id = $1
			LIMIT 1
		`, cleanID)

		o, err := scanOrderRow(row)
		if err != nil {
			return nil
		}
		return o
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, o := range r.mem.Orders {
		if strings.EqualFold(o.OrderID, cleanID) || (o.InvoiceID != "" && strings.EqualFold(o.InvoiceID, cleanID)) {
			copyOrder := o
			return &copyOrder
		}
	}
	return nil
}

func (r *Repository) FindOrderByTransactionID(trxID string) *models.BookOrder {
	cleanTrx := strings.TrimSpace(trxID)
	if cleanTrx == "" {
		return nil
	}

	if r.db != nil {
		row := r.db.QueryRow(`
			SELECT order_id, invoice_id, cus_name, cus_phone, cus_email, amount, currency, transaction_id, payment_method, status, download_token, download_count, created_at, verified_at
			FROM book_orders
			WHERE UPPER(transaction_id) = UPPER($1)
			LIMIT 1
		`, cleanTrx)

		o, err := scanOrderRow(row)
		if err != nil {
			return nil
		}
		return o
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, o := range r.mem.Orders {
		if o.TransactionID != "" && strings.EqualFold(o.TransactionID, cleanTrx) {
			copyOrder := o
			return &copyOrder
		}
	}
	return nil
}

func (r *Repository) UpdateOrderPaid(orderID, invoiceID, transactionID, paymentMethod, downloadToken, cusName, cusPhone, cusEmail string) (*models.BookOrder, error) {
	now := time.Now()
	todayKey := now.Format("2006-01-02")
	cleanID := strings.TrimSpace(orderID)
	cleanTrx := strings.TrimSpace(transactionID)
	cleanInv := strings.TrimSpace(invoiceID)

	if r.db != nil {
		tx, err := r.db.Begin()
		if err != nil {
			return nil, fmt.Errorf("failed to start database transaction: %w", err)
		}
		defer tx.Rollback()

		// 1. Lock existing order row for atomic update
		var priorStatus string
		var priorAmount int
		var priorTrx sql.NullString
		err = tx.QueryRow(`
			SELECT status, amount, transaction_id
			FROM book_orders
			WHERE order_id = $1
			FOR UPDATE
		`, cleanID).Scan(&priorStatus, &priorAmount, &priorTrx)
		if err != nil {
			if err == sql.ErrNoRows {
				return nil, fmt.Errorf("order %s not found", cleanID)
			}
			return nil, fmt.Errorf("failed to lock order row: %w", err)
		}

		// 2. Prevent double spending: check if transactionID is used by another order
		if cleanTrx != "" {
			var conflictOrderID string
			err = tx.QueryRow(`
				SELECT order_id
				FROM book_orders
				WHERE UPPER(transaction_id) = UPPER($1) AND order_id != $2
				LIMIT 1
			`, cleanTrx, cleanID).Scan(&conflictOrderID)
			if err == nil && conflictOrderID != "" {
				return nil, fmt.Errorf("transaction ID %s is already attached to order %s", cleanTrx, conflictOrderID)
			} else if err != nil && err != sql.ErrNoRows {
				return nil, fmt.Errorf("failed to verify transaction uniqueness: %w", err)
			}
		}

		// 3. Update the order
		_, err = tx.Exec(`
			UPDATE book_orders
			SET status = 'PAID',
				invoice_id = CASE WHEN $2 != '' THEN $2 ELSE invoice_id END,
				transaction_id = CASE WHEN $3 != '' THEN $3 ELSE transaction_id END,
				payment_method = CASE WHEN $4 != '' THEN $4 ELSE payment_method END,
				download_token = CASE WHEN $5 != '' THEN $5 ELSE download_token END,
				cus_name = CASE WHEN $6 != '' THEN $6 ELSE cus_name END,
				cus_phone = CASE WHEN $7 != '' THEN $7 ELSE cus_phone END,
				cus_email = CASE WHEN $8 != '' THEN $8 ELSE cus_email END,
				verified_at = $9
			WHERE order_id = $1
		`, cleanID, cleanInv, cleanTrx, paymentMethod, downloadToken, cusName, cusPhone, cusEmail, now)
		if err != nil {
			return nil, fmt.Errorf("failed to update order: %w", err)
		}

		// 4. Update daily traffic revenue idempotently (only if moving from non-PAID to PAID)
		if priorStatus != "PAID" {
			_, err = tx.Exec(`
				INSERT INTO daily_traffic (date_key, page_views, unique_visits, story_reads, book_page_views, book_orders, revenue_bdt)
				VALUES ($1, 0, 0, 0, 0, 1, $2)
				ON CONFLICT (date_key) DO UPDATE SET
					book_orders = daily_traffic.book_orders + 1,
					revenue_bdt = daily_traffic.revenue_bdt + $2
			`, todayKey, priorAmount)
			if err != nil {
				return nil, fmt.Errorf("failed to record revenue: %w", err)
			}
		}

		if err := tx.Commit(); err != nil {
			return nil, fmt.Errorf("failed to commit transaction: %w", err)
		}

		return r.FindOrderByID(cleanID), nil
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	for i := range r.mem.Orders {
		if strings.EqualFold(r.mem.Orders[i].OrderID, cleanID) {
			if cleanTrx != "" {
				for _, other := range r.mem.Orders {
					if strings.EqualFold(other.TransactionID, cleanTrx) && !strings.EqualFold(other.OrderID, cleanID) {
						return nil, fmt.Errorf("transaction ID %s is already attached to order %s", cleanTrx, other.OrderID)
					}
				}
			}

			wasPaid := r.mem.Orders[i].Status == "PAID"
			r.mem.Orders[i].Status = "PAID"
			if cleanInv != "" {
				r.mem.Orders[i].InvoiceID = cleanInv
			}
			if cleanTrx != "" {
				r.mem.Orders[i].TransactionID = cleanTrx
			}
			if paymentMethod != "" {
				r.mem.Orders[i].PaymentMethod = paymentMethod
			}
			if downloadToken != "" {
				r.mem.Orders[i].DownloadToken = downloadToken
			}
			if cusName != "" {
				r.mem.Orders[i].CusName = cusName
			}
			if cusPhone != "" {
				r.mem.Orders[i].CusPhone = cusPhone
			}
			if cusEmail != "" {
				r.mem.Orders[i].CusEmail = cusEmail
			}
			r.mem.Orders[i].VerifiedAt = &now

			if !wasPaid {
				stat := r.mem.TrafficByDate[todayKey]
				stat.Date = todayKey
				stat.BookOrders++
				stat.RevenueBdt += r.mem.Orders[i].Amount
				r.mem.TrafficByDate[todayKey] = stat
			}

			copyOrder := r.mem.Orders[i]
			return &copyOrder, nil
		}
	}

	return nil, fmt.Errorf("order %s not found", cleanID)
}

func (r *Repository) IncrementDownloadCount(orderID string) (int, error) {
	cleanID := strings.TrimSpace(orderID)
	if cleanID == "" {
		return 0, fmt.Errorf("order ID is required")
	}

	if r.db != nil {
		res, err := r.db.Exec(`
			UPDATE book_orders
			SET download_count = download_count + 1
			WHERE order_id = $1 AND download_count < 10
		`, cleanID)
		if err != nil {
			return 0, fmt.Errorf("database error incrementing download: %w", err)
		}

		rows, err := res.RowsAffected()
		if err != nil {
			return 0, err
		}

		if rows == 0 {
			order := r.FindOrderByID(cleanID)
			if order == nil {
				return 0, fmt.Errorf("order %s not found", cleanID)
			}
			if order.DownloadCount >= 10 {
				return order.DownloadCount, fmt.Errorf("download limit exceeded: maximum 10 downloads allowed")
			}
			return 0, fmt.Errorf("failed to increment download count")
		}

		updated := r.FindOrderByID(cleanID)
		if updated != nil {
			return updated.DownloadCount, nil
		}
		return 0, nil
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	for i := range r.mem.Orders {
		if strings.EqualFold(r.mem.Orders[i].OrderID, cleanID) {
			if r.mem.Orders[i].DownloadCount >= 10 {
				return r.mem.Orders[i].DownloadCount, fmt.Errorf("download limit exceeded: maximum 10 downloads allowed")
			}
			r.mem.Orders[i].DownloadCount++
			return r.mem.Orders[i].DownloadCount, nil
		}
	}
	return 0, fmt.Errorf("order %s not found", cleanID)
}
