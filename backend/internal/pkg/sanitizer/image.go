package sanitizer

import (
	"regexp"
	"strings"
)

var validDataURLRegex = regexp.MustCompile(`^data:image/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$`)

// ValidateOptionalImage verifies that if an image is provided, it is strictly JPG/PNG/WEBP <= 2MB.
// If empty, returns true because images are optional!
func ValidateOptionalImage(dataURL string) bool {
	trimmed := strings.TrimSpace(dataURL)
	if trimmed == "" {
		return true
	}
	if strings.HasPrefix(trimmed, "/images/") {
		return !strings.Contains(trimmed, "..")
	}
	if len(trimmed) > 2_900_000 {
		return false
	}
	return validDataURLRegex.MatchString(trimmed)
}

