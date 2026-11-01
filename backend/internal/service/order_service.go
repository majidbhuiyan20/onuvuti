package service

import (
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

func (s *OrderService) RecordBookOrder(order models.BookOrder) models.BookOrder {
	order.CusName = sanitizer.Text(order.CusName, 100)
	order.CusPhone = sanitizer.Text(order.CusPhone, 30)
	order.CusEmail = sanitizer.Text(order.CusEmail, 120)
	order.TransactionID = sanitizer.Text(order.TransactionID, 40)
	if order.Amount <= 0 {
		order.Amount = 99
	}
	if order.Status == "" {
		order.Status = "PAID"
	}
	return s.repo.CreateOrder(order)
}

