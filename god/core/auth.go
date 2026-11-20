package core

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"strconv"
	"strings"
	"time"
)

func GUID(db, uid string) string {
	// Readable identity για το messaging routing (π.χ. "gen20.net:38", "sol:1").
	// Η ασφάλεια δεν βασίζεται στο obscuring του ID — το HMAC στο token την παρέχει.
	return db + ":" + uid
}

// token = base64url("db|uid|role|exp_unix_seconds") + "." + hex(hmac_sha256(secret, payload))
func VerifyAuthToken(tok, secret string) (db, uid, role string, err error) {
	if secret == "" {
		return "", "", "", errors.New("secret not configured")
	}
	parts := strings.SplitN(tok, ".", 2)
	if len(parts) != 2 {
		return "", "", "", errors.New("malformed token")
	}
	payload, e := base64.RawURLEncoding.DecodeString(parts[0])
	if e != nil {
		return "", "", "", errors.New("malformed token")
	}
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(payload)
	if !hmac.Equal([]byte(hex.EncodeToString(mac.Sum(nil))), []byte(parts[1])) {
		return "", "", "", errors.New("bad signature")
	}
	f := strings.Split(string(payload), "|")
	if len(f) != 4 {
		return "", "", "", errors.New("malformed payload")
	}
	exp, e := strconv.ParseInt(f[3], 10, 64)
	if e != nil || time.Now().Unix() > exp {
		return "", "", "", errors.New("expired")
	}
	return f[0], f[1], f[2], nil
}