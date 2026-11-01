package models

import "time"

type BookOrder struct {
	OrderID       string    `json:"orderId"`
	CusName       string    `json:"cusName"`
	CusPhone      string    `json:"cusPhone"`
	CusEmail      string    `json:"cusEmail"`
	Amount        int       `json:"amount"`
	TransactionID string    `json:"transactionId"`
	PaymentMethod string    `json:"paymentMethod"`
	Status        string    `json:"status"` // "PAID" | "PENDING"
	CreatedAt     time.Time `json:"createdAt"`
}

