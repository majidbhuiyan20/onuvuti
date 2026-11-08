package models

import "time"

type MetaPixelSettings struct {
	PixelID                string    `json:"pixelId"`
	IsEnabled              bool      `json:"isEnabled"`
	BrowserTrackingEnabled bool      `json:"browserTrackingEnabled"`
	CAPIEnabled            bool      `json:"capiEnabled"`
	TestEventCode          string    `json:"testEventCode"`
	HasAccessToken         bool      `json:"hasAccessToken"`
	UpdatedAt              time.Time `json:"updatedAt"`
}

type MetaEventLog struct {
	ID           int64     `json:"id"`
	EventName    string    `json:"eventName"`
	EventID      string    `json:"eventId"`
	Source       string    `json:"source"` // "browser" | "server"
	Status       string    `json:"status"` // "received" | "sent" | "failed"
	OrderID      string    `json:"orderId,omitempty"`
	ValueBDT     float64   `json:"valueBdt"`
	Currency     string    `json:"currency"`
	PayloadJSON  string    `json:"payloadJson,omitempty"`
	ErrorMessage string    `json:"errorMessage,omitempty"`
	CreatedAt    time.Time `json:"createdAt"`
}

type MetaPurchaseEvent struct {
	OrderID        string     `json:"orderId"`
	EventID        string     `json:"eventId"`
	AmountBDT      float64    `json:"amountBdt"`
	Currency       string     `json:"currency"`
	BrowserSent    bool       `json:"browserSent"`
	ServerSent     bool       `json:"serverSent"`
	ServerStatus   string     `json:"serverStatus"` // "sent" | "failed" | "pending" | "skipped"
	ServerResponse string     `json:"serverResponse,omitempty"`
	ServerSentAt   *time.Time `json:"serverSentAt,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
}

type MetaEventSummary struct {
	EventName       string     `json:"eventName"`
	Description     string     `json:"description"`
	Status          string     `json:"status"`
	Count           int        `json:"count"`
	LastTriggeredAt *time.Time `json:"lastTriggeredAt,omitempty"`
	Source          string     `json:"source"`
	RecentRef       string     `json:"recentRef,omitempty"`
}

type MetaEbookSale struct {
	Title      string  `json:"title"`
	UnitsSold  int     `json:"unitsSold"`
	RevenueBDT float64 `json:"revenueBdt"`
}

type MetaRecentPurchase struct {
	OrderID      string    `json:"orderId"`
	CustomerName string    `json:"customerName"`
	AmountBDT    float64   `json:"amountBdt"`
	BrowserSent  bool      `json:"browserSent"`
	ServerSent   bool      `json:"serverSent"`
	ServerStatus string    `json:"serverStatus"`
	VerifiedAt   time.Time `json:"verifiedAt"`
}

type MetaSalesTrend struct {
	DateKey        string  `json:"dateKey"`
	Label          string  `json:"label"`
	PurchasesCount int     `json:"purchasesCount"`
	RevenueBDT     float64 `json:"revenueBdt"`
}

type MetaDeliveryStatus struct {
	TotalPurchases     int     `json:"totalPurchases"`
	ServerSentCount    int     `json:"serverSentCount"`
	BrowserSentCount   int     `json:"browserSentCount"`
	DeduplicatedCount  int     `json:"deduplicatedCount"`
	FailedCount        int     `json:"failedCount"`
	PendingCount       int     `json:"pendingCount"`
	DeliveryPercentage float64 `json:"deliveryPercentage"`
}

type MetaPurchaseAnalytics struct {
	TotalVerifiedPurchases int                  `json:"totalVerifiedPurchases"`
	TotalRevenueBDT        float64              `json:"totalRevenueBdt"`
	EbookSales             []MetaEbookSale      `json:"ebookSales"`
	RecentPurchases        []MetaRecentPurchase `json:"recentPurchases"`
	DailySales             []MetaSalesTrend     `json:"dailySales"`
	MonthlySales           []MetaSalesTrend     `json:"monthlySales"`
	DeliveryStatus         MetaDeliveryStatus   `json:"deliveryStatus"`
}
