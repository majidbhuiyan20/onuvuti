package token

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"strconv"
	"strings"
	"time"
)

// SignAdminToken creates an HMAC-SHA256 signed token valid for 24 hours.
func SignAdminToken(secret string) string {
	exp := time.Now().Add(24 * time.Hour).Unix()
	payload := fmt.Sprintf("admin:%d", exp)
	payloadB64 := base64.RawURLEncoding.EncodeToString([]byte(payload))

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payloadB64))
	sig := hex.EncodeToString(mac.Sum(nil))

	return payloadB64 + "." + sig
}

// VerifyAdminToken verifies an HMAC-SHA256 signed admin token using constant-time comparison.
func VerifyAdminToken(tkn, secret string) bool {
	parts := strings.Split(tkn, ".")
	if len(parts) != 2 {
		return false
	}
	payloadB64, sig := parts[0], parts[1]

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payloadB64))
	expectedSig := hex.EncodeToString(mac.Sum(nil))

	if subtle.ConstantTimeCompare([]byte(sig), []byte(expectedSig)) != 1 {
		return false
	}

	raw, err := base64.RawURLEncoding.DecodeString(payloadB64)
	if err != nil {
		return false
	}
	fields := strings.Split(string(raw), ":")
	if len(fields) != 2 || fields[0] != "admin" {
		return false
	}
	exp, err := strconv.ParseInt(fields[1], 10, 64)
	if err != nil {
		return false
	}
	return time.Now().Unix() <= exp
}

