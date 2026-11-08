package service

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
	"unicode"

	"github.com/onuvuti/backend/internal/config"
	"github.com/onuvuti/backend/internal/models"
	"github.com/onuvuti/backend/internal/repository"
)

type MetaService struct {
	cfg        *config.Config
	repo       *repository.Repository
	httpClient *http.Client
}

func NewMetaService(cfg *config.Config, repo *repository.Repository) *MetaService {
	return &MetaService{
		cfg:  cfg,
		repo: repo,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func hashSHA256(val string) string {
	trimmed := strings.ToLower(strings.TrimSpace(val))
	if trimmed == "" {
		return ""
	}
	h := sha256.Sum256([]byte(trimmed))
	return hex.EncodeToString(h[:])
}

func normalizeAndHashPhone(phone string) string {
	var digits []rune
	for _, r := range phone {
		if unicode.IsDigit(r) {
			digits = append(digits, r)
		}
	}
	numStr := string(digits)
	if strings.HasPrefix(numStr, "01") && len(numStr) == 11 {
		numStr = "88" + numStr
	}
	return hashSHA256(numStr)
}

// GetPublicConfig returns non-sensitive pixel settings for frontend initialization.
func (s *MetaService) GetPublicConfig() (map[string]any, error) {
	settings, _, err := s.repo.GetMetaPixelSettings()
	if err != nil {
		return nil, err
	}

	pixelID := settings.PixelID
	if pixelID == "" {
		pixelID = s.cfg.MetaPixelID
	}
	if pixelID == "" {
		pixelID = "4121296221505373"
	}

	return map[string]any{
		"ok":                     true,
		"pixelId":                pixelID,
		"isEnabled":              settings.IsEnabled,
		"browserTrackingEnabled": settings.BrowserTrackingEnabled,
		"capiEnabled":            settings.CAPIEnabled,
	}, nil
}

// GetAdminConfig returns configuration for the admin panel without exposing access tokens.
func (s *MetaService) GetAdminConfig() (*models.MetaPixelSettings, error) {
	settings, rawToken, err := s.repo.GetMetaPixelSettings()
	if err != nil {
		return nil, err
	}

	if !settings.HasAccessToken && s.cfg.MetaAccessToken != "" {
		settings.HasAccessToken = true
	}
	if settings.PixelID == "" {
		settings.PixelID = s.cfg.MetaPixelID
	}
	if settings.PixelID == "" {
		settings.PixelID = "4121296221505373"
	}

	_ = rawToken // never sent in response
	return settings, nil
}

// UpdateAdminConfig saves admin configuration changes.
func (s *MetaService) UpdateAdminConfig(settings models.MetaPixelSettings, newAccessToken string) error {
	return s.repo.UpdateMetaPixelSettings(settings, newAccessToken)
}

// RecordBrowserEvent records a tracking event sent from the frontend.
func (s *MetaService) RecordBrowserEvent(event models.MetaEventLog) error {
	if err := s.repo.RecordMetaEvent(event); err != nil {
		return err
	}

	if event.EventName == "Purchase" && event.OrderID != "" {
		_ = s.repo.MarkMetaPurchaseBrowserSent(event.OrderID)
	}

	return nil
}

// GetEventsDashboardData retrieves event summaries and recent logs for the admin dashboard.
func (s *MetaService) GetEventsDashboardData() ([]models.MetaEventSummary, []models.MetaEventLog, error) {
	summaries, err := s.repo.GetMetaEventsSummary()
	if err != nil {
		return nil, nil, err
	}

	logs, err := s.repo.GetRecentMetaLogs(50)
	if err != nil {
		return nil, nil, err
	}

	return summaries, logs, nil
}

// GetPurchaseAnalytics returns purchase analytics for the admin panel.
func (s *MetaService) GetPurchaseAnalytics() (*models.MetaPurchaseAnalytics, error) {
	return s.repo.GetMetaPurchaseAnalytics()
}

// DispatchPurchaseCAPI sends a server-side Conversions API Purchase event to Meta Graph API.
// Runs asynchronously and safely never blocks user payments or order completion.
func (s *MetaService) DispatchPurchaseCAPI(order models.BookOrder, clientIP, userAgent string) {
	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("[Meta CAPI] Recovered from panic in DispatchPurchaseCAPI: %v", r)
			}
		}()

		eventID := "purchase_" + order.OrderID

		// 1. Initial record in meta_purchase_events
		_ = s.repo.RecordMetaPurchaseEvent(models.MetaPurchaseEvent{
			OrderID:      order.OrderID,
			EventID:      eventID,
			AmountBDT:    float64(order.Amount),
			Currency:     "BDT",
			ServerStatus: "pending",
		})

		// 2. Read settings and token
		settings, dbToken, err := s.repo.GetMetaPixelSettings()
		if err != nil {
			log.Printf("[Meta CAPI] Failed to get pixel settings: %v", err)
			_ = s.repo.UpdateMetaPurchaseServerStatus(order.OrderID, "failed", err.Error(), false)
			return
		}

		if !settings.IsEnabled || !settings.CAPIEnabled {
			log.Printf("[Meta CAPI] Skipping CAPI event for order %s: CAPI is disabled in settings", order.OrderID)
			_ = s.repo.UpdateMetaPurchaseServerStatus(order.OrderID, "skipped", "CAPI disabled in settings", false)
			return
		}

		token := strings.TrimSpace(dbToken)
		if token == "" {
			token = strings.TrimSpace(s.cfg.MetaAccessToken)
		}

		if token == "" {
			msg := "Meta Access Token is not configured (neither in DB nor in META_ACCESS_TOKEN env)"
			log.Printf("[Meta CAPI] Warning for order %s: %s", order.OrderID, msg)
			_ = s.repo.UpdateMetaPurchaseServerStatus(order.OrderID, "failed", msg, false)
			_ = s.repo.RecordMetaEvent(models.MetaEventLog{
				EventName:    "Purchase",
				EventID:      eventID,
				Source:       "server",
				Status:       "failed",
				OrderID:      order.OrderID,
				ValueBDT:     float64(order.Amount),
				Currency:     "BDT",
				ErrorMessage: msg,
			})
			return
		}

		pixelID := strings.TrimSpace(settings.PixelID)
		if pixelID == "" {
			pixelID = strings.TrimSpace(s.cfg.MetaPixelID)
		}
		if pixelID == "" {
			pixelID = "4121296221505373"
		}

		// 3. Prepare User Data (hashed with SHA-256)
		userData := map[string]any{}
		if hashedEmail := hashSHA256(order.CusEmail); hashedEmail != "" {
			userData["em"] = []string{hashedEmail}
		}
		if hashedPhone := normalizeAndHashPhone(order.CusPhone); hashedPhone != "" {
			userData["ph"] = []string{hashedPhone}
		}
		if clientIP != "" {
			userData["client_ip_address"] = clientIP
		}
		if userAgent != "" {
			userData["client_user_agent"] = userAgent
		}

		// 4. Custom Data (Non-sensitive)
		customData := map[string]any{
			"currency":     "BDT",
			"value":        float64(order.Amount),
			"content_name": "স্পর্শের ব্যাকরণ (ই-বুক)",
			"content_ids":  []string{"sporsher-byakoron"},
			"content_type": "product",
			"order_id":     order.OrderID,
		}

		eventData := map[string]any{
			"event_name":       "Purchase",
			"event_time":       time.Now().Unix(),
			"event_id":         eventID,
			"event_source_url": "https://onuvuti.site/payment/success",
			"action_source":    "website",
			"user_data":        userData,
			"custom_data":      customData,
		}

		payload := map[string]any{
			"data": []map[string]any{eventData},
		}

		testCode := strings.TrimSpace(settings.TestEventCode)
		if testCode != "" {
			payload["test_event_code"] = testCode
		}

		payloadBytes, err := json.Marshal(payload)
		if err != nil {
			log.Printf("[Meta CAPI] JSON marshal error: %v", err)
			_ = s.repo.UpdateMetaPurchaseServerStatus(order.OrderID, "failed", err.Error(), false)
			return
		}

		// 5. Send HTTP request to Meta Graph API v21.0
		apiURL := fmt.Sprintf("https://graph.facebook.com/v21.0/%s/events", pixelID)
		req, err := http.NewRequest(http.MethodPost, apiURL, bytes.NewBuffer(payloadBytes))
		if err != nil {
			log.Printf("[Meta CAPI] NewRequest error: %v", err)
			_ = s.repo.UpdateMetaPurchaseServerStatus(order.OrderID, "failed", err.Error(), false)
			return
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)

		resp, err := s.httpClient.Do(req)
		if err != nil {
			log.Printf("[Meta CAPI] Request dispatch error for order %s: %v", order.OrderID, err)
			_ = s.repo.UpdateMetaPurchaseServerStatus(order.OrderID, "failed", err.Error(), false)
			_ = s.repo.RecordMetaEvent(models.MetaEventLog{
				EventName:    "Purchase",
				EventID:      eventID,
				Source:       "server",
				Status:       "failed",
				OrderID:      order.OrderID,
				ValueBDT:     float64(order.Amount),
				Currency:     "BDT",
				PayloadJSON:  string(payloadBytes),
				ErrorMessage: err.Error(),
			})
			return
		}
		defer resp.Body.Close()

		respBody, _ := io.ReadAll(resp.Body)
		respStr := string(respBody)

		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			log.Printf("[Meta CAPI] Purchase event successfully delivered for order %s (Status: %d)", order.OrderID, resp.StatusCode)
			_ = s.repo.UpdateMetaPurchaseServerStatus(order.OrderID, "sent", respStr, true)
			_ = s.repo.RecordMetaEvent(models.MetaEventLog{
				EventName:   "Purchase",
				EventID:     eventID,
				Source:      "server",
				Status:      "sent",
				OrderID:     order.OrderID,
				ValueBDT:    float64(order.Amount),
				Currency:    "BDT",
				PayloadJSON: string(payloadBytes),
			})
		} else {
			log.Printf("[Meta CAPI] Meta API returned status %d for order %s: %s", resp.StatusCode, order.OrderID, respStr)
			_ = s.repo.UpdateMetaPurchaseServerStatus(order.OrderID, "failed", respStr, false)
			_ = s.repo.RecordMetaEvent(models.MetaEventLog{
				EventName:    "Purchase",
				EventID:      eventID,
				Source:       "server",
				Status:       "failed",
				OrderID:      order.OrderID,
				ValueBDT:     float64(order.Amount),
				Currency:     "BDT",
				PayloadJSON:  string(payloadBytes),
				ErrorMessage: respStr,
			})
		}
	}()
}

// SendTestCAPIEvent allows admin to test CAPI connectivity with Meta Events Manager.
func (s *MetaService) SendTestCAPIEvent(testCode string) (map[string]any, error) {
	settings, dbToken, err := s.repo.GetMetaPixelSettings()
	if err != nil {
		return nil, err
	}

	token := strings.TrimSpace(dbToken)
	if token == "" {
		token = strings.TrimSpace(s.cfg.MetaAccessToken)
	}
	if token == "" {
		return nil, fmt.Errorf("Meta Access Token is not set. Please enter your Access Token in settings first.")
	}

	pixelID := strings.TrimSpace(settings.PixelID)
	if pixelID == "" {
		pixelID = strings.TrimSpace(s.cfg.MetaPixelID)
	}
	if pixelID == "" {
		pixelID = "4121296221505373"
	}

	code := strings.TrimSpace(testCode)
	if code == "" {
		code = strings.TrimSpace(settings.TestEventCode)
	}

	testEventID := fmt.Sprintf("test_capi_%d", time.Now().Unix())
	eventData := map[string]any{
		"event_name":       "Purchase",
		"event_time":       time.Now().Unix(),
		"event_id":         testEventID,
		"event_source_url": "https://onuvuti.site/admin",
		"action_source":    "website",
		"user_data": map[string]any{
			"em": []string{hashSHA256("test_reader@onuvuti.site")},
			"ph": []string{normalizeAndHashPhone("01700000000")},
		},
		"custom_data": map[string]any{
			"currency":     "BDT",
			"value":        99.00,
			"content_name": "স্পর্শের ব্যাকরণ (টেস্ট ইভেন্ট)",
			"content_ids":  []string{"sporsher-byakoron-test"},
			"content_type": "product",
		},
	}

	payload := map[string]any{
		"data": []map[string]any{eventData},
	}
	if code != "" {
		payload["test_event_code"] = code
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	apiURL := fmt.Sprintf("https://graph.facebook.com/v21.0/%s/events", pixelID)
	req, err := http.NewRequest(http.MethodPost, apiURL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("Meta API connection error: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	var metaResp map[string]any
	_ = json.Unmarshal(respBody, &metaResp)

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("Meta API returned HTTP %d: %s", resp.StatusCode, string(respBody))
	}

	// Record test log
	_ = s.repo.RecordMetaEvent(models.MetaEventLog{
		EventName:   "Purchase",
		EventID:     testEventID,
		Source:      "server",
		Status:      "sent",
		ValueBDT:    99.0,
		Currency:    "BDT",
		PayloadJSON: string(payloadBytes),
	})

	return metaResp, nil
}
