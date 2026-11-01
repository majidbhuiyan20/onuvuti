package models

import "time"

type BookOrder struct {
	OrderID       string     `json:"orderId"`
	InvoiceID     string     `json:"invoiceId,omitempty"`
	CusName       string     `json:"cusName"`
	CusPhone      string     `json:"cusPhone"`
	CusEmail      string     `json:"cusEmail"`
	Amount        int        `json:"amount"`
	Currency      string     `json:"currency,omitempty"`
	TransactionID string     `json:"transactionId,omitempty"`
	PaymentMethod string     `json:"paymentMethod,omitempty"`
	Status        string     `json:"status"` // "PAID" | "PENDING" | "CANCELLED"
	DownloadToken string     `json:"downloadToken,omitempty"`
	DownloadCount int        `json:"downloadCount"`
	CreatedAt     time.Time  `json:"createdAt"`
	VerifiedAt    *time.Time `json:"verifiedAt,omitempty"`
}
