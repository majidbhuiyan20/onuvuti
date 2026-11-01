package repository

import (
	"log"
	"time"

	"github.com/onuvuti/backend/internal/models"
)

func (r *Repository) ListOrders() []models.BookOrder {
	if r.db != nil {
		rows, err := r.db.Query(`
			SELECT order_id, cus_name, cus_phone, cus_email, amount, transaction_id, payment_method, status, created_at
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
			var o models.BookOrder
			if err := rows.Scan(&o.OrderID, &o.CusName, &o.CusPhone, &o.CusEmail, &o.Amount, &o.TransactionID, &o.PaymentMethod, &o.Status, &o.CreatedAt); err == nil {
				out = append(out, o)
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

	todayKey := order.CreatedAt.Format("2006-01-02")

	if r.db != nil {
		_, err := r.db.Exec(`
			INSERT INTO book_orders (order_id, cus_name, cus_phone, cus_email, amount, transaction_id, payment_method, status, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
			ON CONFLICT (order_id) DO UPDATE SET
				status = EXCLUDED.status,
				transaction_id = EXCLUDED.transaction_id
		`, order.OrderID, order.CusName, order.CusPhone, order.CusEmail, order.Amount, order.TransactionID, order.PaymentMethod, order.Status, order.CreatedAt)
		if err != nil {
			log.Printf("⚠️ PostgreSQL CreateOrder error: %v", err)
		}

		// Update today's revenue in daily_traffic
		_, _ = r.db.Exec(`
			INSERT INTO daily_traffic (date_key, page_views, unique_visits, story_reads, book_page_views, book_orders, revenue_bdt)
			VALUES ($1, 1, 1, 0, 1, 1, $2)
			ON CONFLICT (date_key) DO UPDATE SET
				book_orders = daily_traffic.book_orders + 1,
				revenue_bdt = daily_traffic.revenue_bdt + $2
		`, todayKey, order.Amount)

		return order
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	r.mem.Orders = append([]models.BookOrder{order}, r.mem.Orders...)
	stat := r.mem.TrafficByDate[todayKey]
	stat.Date = todayKey
	stat.BookOrders++
	stat.RevenueBdt += order.Amount
	r.mem.TrafficByDate[todayKey] = stat

	return order
}
