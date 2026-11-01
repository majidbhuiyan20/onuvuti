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

func (r *Repository) CreateOrder(order models.BookOrder) models.BookOrder {
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
		_, err := r.db.Exec(`
			INSERT INTO book_orders (
				order_id, invoice_id, cus_name, cus_phone, cus_email,
				amount, currency, transaction_id, payment_method, status,
				download_token, download_count, created_at, verified_at
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
			ON CONFLICT (order_id) DO UPDATE SET
				invoice_id = CASE WHEN EXCLUDED.invoice_id != '' THEN EXCLUDED.invoice_id ELSE book_orders.invoice_id END,
				status = EXCLUDED.status,
				transaction_id = CASE WHEN EXCLUDED.transaction_id != '' THEN EXCLUDED.transaction_id ELSE book_orders.transaction_id END,
				download_token = CASE WHEN EXCLUDED.download_token != '' THEN EXCLUDED.download_token ELSE book_orders.download_token END
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
		}

		return order
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	r.mem.Orders = append([]models.BookOrder{order}, r.mem.Orders...)
	return order
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

func (r *Repository) UpdateOrderPaid(orderID, invoiceID, transactionID, paymentMethod, downloadToken string) (*models.BookOrder, error) {
	now := time.Now()
	todayKey := now.Format("2006-01-02")

	if r.db != nil {
		// Verify if transactionID is already used by a DIFFERENT order
		if transactionID != "" {
			existing := r.FindOrderByTransactionID(transactionID)
			if existing != nil && !strings.EqualFold(existing.OrderID, orderID) {
				return nil, fmt.Errorf("transaction ID %s is already attached to order %s", transactionID, existing.OrderID)
			}
		}

		// Check prior status for idempotent revenue tracking
		prior := r.FindOrderByID(orderID)
		if prior == nil {
			return nil, fmt.Errorf("order %s not found", orderID)
		}

		res, err := r.db.Exec(`
			UPDATE book_orders
			SET status = 'PAID',
				invoice_id = CASE WHEN $2 != '' THEN $2 ELSE invoice_id END,
				transaction_id = CASE WHEN $3 != '' THEN $3 ELSE transaction_id END,
				payment_method = CASE WHEN $4 != '' THEN $4 ELSE payment_method END,
				download_token = CASE WHEN $5 != '' THEN $5 ELSE download_token END,
				verified_at = $6
			WHERE order_id = $1
		`, orderID, invoiceID, transactionID, paymentMethod, downloadToken, now)

		if err != nil {
			return nil, err
		}
		affected, _ := res.RowsAffected()
		if affected == 0 {
			return nil, fmt.Errorf("order %s not found for update", orderID)
		}

		// Only increment revenue if transitioning from PENDING to PAID (idempotency!)
		if prior.Status != "PAID" {
			_, _ = r.db.Exec(`
				INSERT INTO daily_traffic (date_key, page_views, unique_visits, story_reads, book_page_views, book_orders, revenue_bdt)
				VALUES ($1, 0, 0, 0, 0, 1, $2)
				ON CONFLICT (date_key) DO UPDATE SET
					book_orders = daily_traffic.book_orders + 1,
					revenue_bdt = daily_traffic.revenue_bdt + $2
			`, todayKey, prior.Amount)
		}

		return r.FindOrderByID(orderID), nil
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	for i := range r.mem.Orders {
		if strings.EqualFold(r.mem.Orders[i].OrderID, orderID) {
			wasPaid := r.mem.Orders[i].Status == "PAID"
			r.mem.Orders[i].Status = "PAID"
			if invoiceID != "" {
				r.mem.Orders[i].InvoiceID = invoiceID
			}
			if transactionID != "" {
				r.mem.Orders[i].TransactionID = transactionID
			}
			if paymentMethod != "" {
				r.mem.Orders[i].PaymentMethod = paymentMethod
			}
			if downloadToken != "" {
				r.mem.Orders[i].DownloadToken = downloadToken
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

	return nil, fmt.Errorf("order %s not found", orderID)
}

func (r *Repository) IncrementDownloadCount(orderID string) error {
	if r.db != nil {
		_, err := r.db.Exec(`
			UPDATE book_orders
			SET download_count = download_count + 1
			WHERE order_id = $1
		`, orderID)
		return err
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	for i := range r.mem.Orders {
		if strings.EqualFold(r.mem.Orders[i].OrderID, orderID) {
			r.mem.Orders[i].DownloadCount++
			return nil
		}
	}
	return nil
}
