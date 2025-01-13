package core

import (
	"context"
	"log"
	"github.com/go-redis/redis/v8"
)

var ctx = context.Background()

// ConnectToRedis establishes a connection to the Redis database
func ConnectToRedis() *redis.Client {
	redisOptions := &redis.Options{
		Addr:     "localhost:6379", // Change to your Redis server address
		Password: "",                // No password set (default)
		DB:       1,                 // Use database 1
	}

	client := redis.NewClient(redisOptions)

	// Ping the Redis server to ensure the connection is established
	_, err := client.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	log.Println("Connected to Redis database 1")
	return client
}
