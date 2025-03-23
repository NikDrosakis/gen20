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
		Password: "yjF1f7uiHttcp",         // No password by default, adjust if needed
		DB:       0,                      // Use default DB
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

// Set sets a key with a value, handling different types
func (g *Gredis) Set(key string, fetch interface{}, options ...time.Duration) error {
	if fetch == nil {
		return fmt.Errorf("value to set cannot be nil")
	}

	var setOptions *redis.SetArgs
	if len(options) > 0 {
		setOptions = &redis.SetArgs{
			Mode: "XX",
			TTL: options[0],
		}
	}

	switch v := fetch.(type) {
	case int:
		err := g.client.Set(g.ctx, key, v, 0).Err()
		if err != nil {
			return fmt.Errorf("failed to set int value: %w", err)
		}
	case []interface{}:
		jsonValue, err := json.Marshal(v)
		if err != nil {
			return fmt.Errorf("failed to marshal array to json: %w", err)
		}
		err = g.client.SetEX(g.ctx, key, jsonValue, 1000*time.Second).Err() // Corrected line
		if err != nil {
			return fmt.Errorf("failed to set json value: %w", err)
		}
	case string:
		if IsJSON(v) {
			err := g.client.Set(g.ctx, key, v, 0).Err()
			if err != nil {
				return fmt.Errorf("failed to set json string value: %w", err)
			}
		} else {
			err := g.client.Set(g.ctx, key, v, 0).Err()
			if err != nil {
				return fmt.Errorf("failed to set string value: %w", err)
			}
		}
	default:
		err := g.client.Set(g.ctx, key, fmt.Sprintf("%v", v), 0).Err()
		if err != nil {
			return fmt.Errorf("failed to set value: %w", err)
		}
	}

	if setOptions == nil {
		err := g.client.Persist(g.ctx, key).Err()
		if err != nil {
			return fmt.Errorf("failed to persist key: %w", err)
		}
	}

	return nil
}
// Keys retrieves all keys matching a given pattern
func (g *Gredis) Keys(pattern string) ([]string, error) {
	keys, err := g.client.Keys(g.ctx, pattern).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve keys: %w", err)
	}
	return keys, nil
}
// Helper function to check if a string is JSON
func IsJSON(str string) bool {
	var js json.RawMessage
	return json.Unmarshal([]byte(str), &js) == nil
}