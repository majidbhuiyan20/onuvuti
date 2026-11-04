package sanitizer

import (
	"regexp"
	"strings"
)

var validDataURLRegex = regexp.MustCompile(`(?i)^data:image/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=\r\n]+$`)

// ValidateOptionalImage verifies that if an image is provided, it is strictly JPG/PNG/WEBP <= 10MB.
// If empty, returns true because images are optional!
func ValidateOptionalImage(dataURL string) bool {
	trimmed := strings.TrimSpace(dataURL)
	if trimmed == "" {
		return true
	}
	if strings.HasPrefix(trimmed, "/images/") {
		return !strings.Contains(trimmed, "..")
	}
	if len(trimmed) > 10_000_000 {
		return false
	}
	return validDataURLRegex.MatchString(trimmed)
}
