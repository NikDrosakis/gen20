// god/core/gredis.go
package core

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

// Gredis είναι ο wrapper για τον Redis client.
type Gredis struct {
	client *redis.Client
	ctx    context.Context
}

func NewGredis() (*Gredis, error) {
	addr := os.Getenv("REDIS_ADDR")
	if addr == "" {
		addr = "localhost:6379"
	}
	password := os.Getenv("REDIS_PASS")

	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       0,
	})

	ctx := context.Background()

	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("gredis: ping failed: %w", err)
	}

	return &Gredis{
		client: rdb,
		ctx:    ctx,
	}, nil
}

// ===== GENERIC =====

func (g *Gredis) Get(key string) (string, error) {
	val, err := g.client.Get(g.ctx, key).Result()
	if err == redis.Nil {
		return "", nil
	}
	return val, err
}

func (g *Gredis) Set(key, value string, ttl int) error {
	var expiration time.Duration
	if ttl > 0 {
		expiration = time.Duration(ttl) * time.Second
	}
	return g.client.Set(g.ctx, key, value, expiration).Err()
}

func (g *Gredis) Del(key string) error {
	return g.client.Del(g.ctx, key).Err()
}

func (g *Gredis) Keys(pattern string) ([]string, error) {
	return g.client.Keys(g.ctx, pattern).Result()
}

func (g *Gredis) SAdd(key string, members ...interface{}) error {
	return g.client.SAdd(g.ctx, key, members...).Err()
}

func (g *Gredis) SRem(key string, members ...interface{}) error {
	return g.client.SRem(g.ctx, key, members...).Err()
}

func (g *Gredis) SMembers(key string) ([]string, error) {
	return g.client.SMembers(g.ctx, key).Result()
}

func (g *Gredis) Incr(key string) (int64, error) {
	return g.client.Incr(g.ctx, key).Result()
}

// Client επιστρέφει τον underlying redis client (για προχωρημένες χρήσεις).
func (g *Gredis) Client() *redis.Client {
	return g.client
}

func (g *Gredis) Ctx() context.Context {
	return g.ctx
}