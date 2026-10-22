package core

import (
	"context"
	"encoding/json"
	"fmt"
	"time"
	"os"

	"github.com/joho/godotenv"
	"github.com/go-redis/redis/v8"
)

// Gredis struct to encapsulate Redis client
type Gredis struct {
	client *redis.Client
	ctx    context.Context
}

// NewGredis initializes a new Gredis instance
func NewGredis() (*Gredis, error) {
	// Load environment variables
	godotenv.Load()

	rdb := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_URI"), // REDIS_URL should be set in your .env file
		Password: "yjF1f7uiHttcp",       // No password by default, adjust if needed
		DB:       2,                      // Use default DB
	})

	ctx := context.Background()
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return &Gredis{
		client: rdb,
		ctx:    ctx,
	}, nil
}

// Get retrieves a value from Redis
func (g *Gredis) Get(key string) (string, error) {
	val, err := g.client.Get(g.ctx, key).Result()
	if err == redis.Nil {
		return "", nil // Key doesn't exist (not treated as error)
	}
	if err != nil {
		return "", fmt.Errorf("failed to get key %s: %w", key, err)
	}
	return val, nil
}

// Set sets a key with a value, handling different types
func (g *Gredis) Set(key string, value interface{}, expiration int) error {
	if value == nil {
		return fmt.Errorf("value to set cannot be nil")
	}

	var err error
	exp := time.Duration(expiration) * time.Second

	switch v := value.(type) {
	case string:
		if IsJSON(v) {
			// Store JSON strings directly
			err = g.client.Set(g.ctx, key, v, exp).Err()
		} else {
			// Escape regular strings to ensure proper storage
			err = g.client.Set(g.ctx, key, v, exp).Err()
		}
	case []byte:
		err = g.client.Set(g.ctx, key, v, exp).Err()
	default:
		// Marshal other types to JSON
		jsonValue, err := json.Marshal(v)
		if err != nil {
			return fmt.Errorf("failed to marshal value: %w", err)
		}
		err = g.client.Set(g.ctx, key, jsonValue, exp).Err()
	}

	if err != nil {
		return fmt.Errorf("failed to set key %s: %w", key, err)
	}
	return nil
}

// SetEx sets a key with expiration (explicit version)
func (g *Gredis) SetEx(key string, value interface{}, expiration time.Duration) error {
	return g.client.Set(g.ctx, key, value, expiration).Err()
}

// Keys retrieves all keys matching a given pattern
func (g *Gredis) Keys(pattern string) ([]string, error) {
	keys, err := g.client.Keys(g.ctx, pattern).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve keys: %w", err)
	}
	return keys, nil
}

// Close terminates the Redis connection
func (g *Gredis) Close() error {
	return g.client.Close()
}

// Helper function to check if a string is JSON
func IsJSON(str string) bool {
	var js json.RawMessage
	return json.Unmarshal([]byte(str), &js) == nil
}