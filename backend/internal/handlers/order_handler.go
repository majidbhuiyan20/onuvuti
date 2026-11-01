package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/pkg/response"
	"github.com/onuvuti/backend/internal/service"
)

type OrderHandler struct {
	orderSvc *service.OrderService
}

func NewOrderHandler(orderSvc *service.OrderService) *OrderHandler {
	return &OrderHandler{orderSvc: orderSvc}
}

func (h *OrderHandler) RecordOrder(w http.ResponseWriter, r *http.Request) {
	var order models.BookOrder
	if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
		response.Error(w, http.StatusBadRequest, "অর্ডার তথ্য সঠিক নয়।")
		return
	}

	saved := h.orderSvc.RecordBookOrder(order)
	response.JSON(w, http.StatusCreated, map[string]any{
		"ok":    true,
		"order": saved,
	})
}

