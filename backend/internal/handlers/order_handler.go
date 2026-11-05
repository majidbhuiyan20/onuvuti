package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

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

func (h *OrderHandler) ListAdminOrders(w http.ResponseWriter, r *http.Request) {
	orders := h.orderSvc.ListOrders()
	response.JSON(w, http.StatusOK, map[string]any{
		"ok":     true,
		"orders": orders,
		"count":  len(orders),
	})
}

func (h *OrderHandler) RecordOrder(w http.ResponseWriter, r *http.Request) {
	var order models.BookOrder
	if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
		response.Error(w, http.StatusBadRequest, "অর্ডার তথ্য সঠিক নয়।")
		return
	}

	saved, err := h.orderSvc.RecordBookOrder(order)
	if err != nil {
		response.Error(w, http.StatusConflict, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{
		"ok":    true,
		"order": saved,
	})
}

func (h *OrderHandler) GetOrder(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/orders/")
	id = strings.TrimSpace(id)
	if id == "" {
		response.Error(w, http.StatusBadRequest, "অর্ডার আইডি প্রয়োজন।")
		return
	}

	order := h.orderSvc.GetOrder(id)
	if order == nil {
		response.Error(w, http.StatusNotFound, "অর্ডারটি পাওয়া যায়নি।")
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"order": order,
	})
}

func (h *OrderHandler) CheckTransaction(w http.ResponseWriter, r *http.Request) {
	trxID := strings.TrimPrefix(r.URL.Path, "/api/v1/orders/trx/")
	trxID = strings.TrimSpace(trxID)
	if trxID == "" {
		response.Error(w, http.StatusBadRequest, "ট্রানজেকশন আইডি প্রয়োজন।")
		return
	}

	existing := h.orderSvc.GetOrderByTransactionID(trxID)
	if existing != nil {
		response.JSON(w, http.StatusOK, map[string]any{
			"ok":     true,
			"exists": true,
			"order":  existing,
		})
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":     true,
		"exists": false,
	})
}

type MarkPaidRequest struct {
	InvoiceID     string `json:"invoiceId"`
	TransactionID string `json:"transactionId"`
	PaymentMethod string `json:"paymentMethod"`
	DownloadToken string `json:"downloadToken"`
	CusName       string `json:"cusName,omitempty"`
	CusPhone      string `json:"cusPhone,omitempty"`
	CusEmail      string `json:"cusEmail,omitempty"`
}

func (h *OrderHandler) MarkPaid(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/orders/")
	id = strings.TrimSuffix(id, "/paid")
	id = strings.TrimSpace(id)

	var req MarkPaidRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "পেমেন্ট তথ্য সঠিক নয়।")
		return
	}

	updated, err := h.orderSvc.MarkOrderPaid(id, req.InvoiceID, req.TransactionID, req.PaymentMethod, req.DownloadToken, req.CusName, req.CusPhone, req.CusEmail)
	if err != nil {
		response.Error(w, http.StatusConflict, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"order": updated,
	})
}

func (h *OrderHandler) RecordDownload(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/orders/")
	id = strings.TrimSuffix(id, "/download")
	id = strings.TrimSpace(id)

	count, err := h.orderSvc.RecordDownload(id)
	if err != nil {
		if strings.Contains(err.Error(), "limit exceeded") {
			response.Error(w, http.StatusForbidden, err.Error())
			return
		}
		response.Error(w, http.StatusInternalServerError, "ডাউনলোড কাউন্ট আপডেট করা যায়নি।")
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"ok":            true,
		"downloadCount": count,
	})
}
