package service

import (
	"fmt"
	"strings"

	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/sanitizer"
	"github.com/onuvuti/backend/internal/repository"
)

type OrderService struct {
	repo *repository.Repository
}

func NewOrderService(repo *repository.Repository) *OrderService {
	return &OrderService{repo: repo}
}

func (s *OrderService) CreatePendingOrder(order models.BookOrder) (*models.BookOrder, error) {
	order.OrderID = strings.TrimSpace(order.OrderID)
	order.InvoiceID = strings.TrimSpace(order.InvoiceID)
	order.CusName = sanitizer.Text(order.CusName, 100)
	order.CusPhone = sanitizer.Text(order.CusPhone, 30)
	order.CusEmail = sanitizer.Text(order.CusEmail, 120)
	order.TransactionID = sanitizer.Text(order.TransactionID, 40)
	if order.Amount <= 0 {
		order.Amount = 99
	}
	if order.Currency == "" {
		order.Currency = "BDT"
	}
	if order.Status == "" {
		order.Status = "PENDING"
	}
	return s.repo.CreateOrder(order)
}

func (s *OrderService) RecordBookOrder(order models.BookOrder) (*models.BookOrder, error) {
	return s.CreatePendingOrder(order)
}

func (s *OrderService) GetOrder(id string) *models.BookOrder {
	return s.repo.FindOrderByID(id)
}

func (s *OrderService) GetOrderByTransactionID(trxID string) *models.BookOrder {
	return s.repo.FindOrderByTransactionID(trxID)
}

func (s *OrderService) MarkOrderPaid(orderID, invoiceID, transactionID, paymentMethod, downloadToken, cusName, cusPhone, cusEmail string) (*models.BookOrder, error) {
	cleanID := strings.TrimSpace(orderID)
	cleanTrx := strings.TrimSpace(transactionID)
	cleanInv := strings.TrimSpace(invoiceID)

	if cleanID == "" {
		return nil, fmt.Errorf("order ID is required")
	}

	return s.repo.UpdateOrderPaid(cleanID, cleanInv, cleanTrx, paymentMethod, downloadToken, cusName, cusPhone, cusEmail)
}

func (s *OrderService) RecordDownload(orderID string) (int, error) {
	return s.repo.IncrementDownloadCount(strings.TrimSpace(orderID))
}
