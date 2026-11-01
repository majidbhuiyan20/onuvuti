package sanitizer

import (
	"regexp"
	"strings"
)

var (
	scriptBlocksRegex = regexp.MustCompile(`(?is)<(script|iframe|object|embed|style|svg|math)[^>]*>.*?</(script|iframe|object|embed|style|svg|math)>`)
	htmlTagRegex      = regexp.MustCompile(`<[^>]*>`)
	eventAttrRegex    = regexp.MustCompile(`(?i)\bon\w+\s*=`)
	jsProtoRegex      = regexp.MustCompile(`(?i)(javascript|vbscript|data\s*:\s*text/html)\s*:`)
)

// Text strips XSS payloads, script blocks, HTML tags, and control bytes while preserving Bengali Unicode.
func Text(input string, maxRunes int) string {
	s := strings.TrimSpace(input)
	if s == "" {
		return ""
	}
	s = scriptBlocksRegex.ReplaceAllString(s, "")
	s = htmlTagRegex.ReplaceAllString(s, "")
	s = eventAttrRegex.ReplaceAllString(s, "")
	s = jsProtoRegex.ReplaceAllString(s, "")
	s = strings.Map(func(r rune) rune {
		if r == '\n' || r == '\r' || r == '\t' {
			return r
		}
		if r < 32 || r == 127 {
			return -1
		}
		return r
	}, s)
	s = strings.TrimSpace(s)

	runes := []rune(s)
	if maxRunes > 0 && len(runes) > maxRunes {
		return string(runes[:maxRunes])
	}
	return s
}

