package repository

import (
	"log"
	"time"

	"github.com/onuvuti/backend/internal/models"
)

func (r *Repository) ListOrders() []models.BookOrder {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.state.Orders
}

func (r *Repository) CreateOrder(order models.BookOrder) models.BookOrder {
	r.mu.Lock()
	defer r.mu.Unlock()

	if order.CreatedAt.IsZero() {
		order.CreatedAt = time.Now()
	}
	r.state.Orders = append([]models.BookOrder{order}, r.state.Orders...)

	// Update today's traffic revenue & order counter
	todayKey := order.CreatedAt.Format("2006-01-02")
	stat := r.state.TrafficByDate[todayKey]
	stat.Date = todayKey
	stat.BookOrders++
	stat.RevenueBdt += order.Amount
	r.state.TrafficByDate[todayKey] = stat

	_ = r.saveLocked()

	if r.pg != nil {
		_, err := r.pg.Exec(`
			INSERT INTO book_orders (order_id, cus_name, cus_phone, cus_email, amount, transaction_id, payment_method, status, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
			ON CONFLICT (order_id) DO UPDATE SET status = EXCLUDED.status, transaction_id = EXCLUDED.transaction_id
		`, order.OrderID, order.CusName, order.CusPhone, order.CusEmail, order.Amount, order.TransactionID, order.PaymentMethod, order.Status, order.CreatedAt)
		if err != nil {
			log.Printf("[PostgreSQL] insert order error: %v", err)
		}
	}

	return order
}

