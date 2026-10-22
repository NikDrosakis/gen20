package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"crypto/md5"
	"context"
    "crypto/subtle"
    "time"
"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/gorilla/websocket"
	"god/services/claude"
	"god/services/mermaid"
	"god/core"
)

var logFile *os.File
var logger *log.Logger
var gredisInstance *core.Gredis

func GenerateCacheKey(url string) string {
	hash := md5.Sum([]byte(url))
	return fmt.Sprintf("%x", hash)
}


func init() {
	var err error

	logFile, err = os.OpenFile(
		"/var/www/gs/log/god.log",
		os.O_APPEND|os.O_CREATE|os.O_WRONLY,
		0644,
	)
	if err != nil {
		log.Fatalf("Failed to open log file: %v", err)
	}

	logger = log.New(
		io.MultiWriter(logFile, os.Stdout),
		"GOD: ",
		log.LstdFlags,
	)

	gredisInstance, err = core.NewGredis()
	if err != nil {
		logMessage(fmt.Sprintf("Failed to create Gredis instance: %v", err))
	}
}

func logMessage(message string) {
    if os.Getenv("GOD_LOGGING_ENABLED") == "true" {
        logger.Println(message)
    } else {
        logger.Output(2, message)
    }
}

func getUrl(c *gin.Context) {
    url := c.DefaultQuery("url", "")
    if url == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "URL parameter is required"})
        return
    }

    cacheKey := fmt.Sprintf("cubo_%s", GenerateCacheKey(url))

    // 1. Check cache first
    cachedResponse, err := gredisInstance.Get(cacheKey)
    if err == nil && cachedResponse != "" {
        c.Data(http.StatusOK, "application/json", []byte(cachedResponse)) // Serve raw JSON
        return
    }

    // 2. Fetch data if not cached
    resp, err := http.Get(url)
    if err != nil {
        logMessage(fmt.Sprintf("Error fetching URL: %v", err))
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch URL"})
        return
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        logMessage(fmt.Sprintf("Error reading body: %v", err))
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response body"})
        return
    }

    // 3. Store in Redis before returning
    jsonResponse := fmt.Sprintf(string(body))
    err = gredisInstance.Set(cacheKey, jsonResponse, 3600) // Cache for 1 hour
    if err != nil {
        logMessage(fmt.Sprintf("Error caching response: %v", err))
    }

    // 4. Return fetched data
    c.Data(http.StatusOK, "application/json", []byte(jsonResponse))
}

func registerMCPRoutes(router *gin.Engine) {
    token := os.Getenv("GEN20_MCP_TOKEN")
    if token == "" {
        logMessage("MCP disabled: GEN20_MCP_TOKEN is not configured")
        return
    }

    server := mcp.NewServer(
        &mcp.Implementation{
            Name:    "gen20-mcp-bridge",
            Version: "0.1.0",
        },
        nil,
    )

    mcp.AddTool(
        server,
        &mcp.Tool{
            Name:        "gen20_status",
            Description: "Checks whether the Gen20 God API is reachable. Read-only.",
        },
        func(
            ctx context.Context,
            req *mcp.CallToolRequest,
            input struct{},
        ) (*mcp.CallToolResult, any, error) {
            client := &http.Client{Timeout: 3 * time.Second}

            request, err := http.NewRequestWithContext(
                ctx,
                http.MethodGet,
                "http://127.0.0.1:3008/god/v1/",
                nil,
            )
            if err != nil {
                return nil, nil, err
            }

            resp, err := client.Do(request)
            if err != nil {
                return nil, map[string]any{
                    "god_reachable": false,
                    "error":         "God API is unreachable",
                }, nil
            }
            defer resp.Body.Close()

            return nil, map[string]any{
                "god_reachable": resp.StatusCode >= 200 &&
                    resp.StatusCode < 500,
                "http_status": resp.StatusCode,
            }, nil
        },
    )

    handler := mcp.NewStreamableHTTPHandler(
        func(r *http.Request) *mcp.Server {
            return server
        },
        &mcp.StreamableHTTPOptions{
            JSONResponse: true,
        },
    )

    router.Any("/mcp", func(c *gin.Context) {
        auth := c.GetHeader("Authorization")
        expected := "Bearer " + token

        if subtle.ConstantTimeCompare(
            []byte(auth),
            []byte(expected),
        ) != 1 {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
                "error": "Unauthorized",
            })
            return
        }

        handler.ServeHTTP(c.Writer, c.Request)
    })
}
func main() {
    defer logFile.Close()
    godotenv.Load()

    router := gin.Default()
    registerMCPRoutes(router)
    router.LoadHTMLGlob("public/*")

    mermaid.RegisterRoutes(router)
    claudeAPIKey := os.Getenv("CLAUDE_APIKEY")
    claudeClient := claude.NewClient(claudeAPIKey)
    router = claudeClient.SetupRouter(router)

    v1 := router.Group("/god/v1")
    {
        v1.GET("/", func(c *gin.Context) {
            routes := router.Routes()
            var routeList []map[string]string
            for _, route := range routes {
                routeList = append(routeList, map[string]string{
                    "Path":   route.Path,
                    "Method": route.Method,
                })
            }

            c.HTML(http.StatusOK, "index.html", gin.H{
                "title":     "God Gin App Landing Page",
                "endpoints": routeList,
            })
        })
        v1.GET("/getUrl", getUrl)

        v1.GET("/ws", func(c *gin.Context) {
            upgrader := websocket.Upgrader{}
            conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
            if err != nil {
                logMessage(fmt.Sprintf("Error upgrading connection: %v", err))
                return
            }
            defer conn.Close()
            for {
                messageType, p, err := conn.ReadMessage()
                if err != nil {
                     logMessage(fmt.Sprintf("Error reading message:", err))
                    return
                }
                log.Printf("Received message: %s\n", string(p))
                err = conn.WriteMessage(messageType, p)
                if err != nil {
                     logMessage(fmt.Sprintf("Error writing message:", err))
                    return
                }
            }
        })

        wsClient, err := core.NewWebSocketClient()
        if err != nil {
             logMessage(fmt.Sprintf("WebSocket connection failed, continuing without it..."))
        } else {
            defer wsClient.Close()
        }

        if wsClient != nil {
            err = wsClient.SendMessage()
            if err != nil {
                logMessage(fmt.Sprintf("WebSocket failed to send message: %v", err))
            } else {
                 logMessage(fmt.Sprintf("Message sent successfully."))
            }
        } else {
             logMessage(fmt.Sprintf("Skipping WebSocket message send since connection is unavailable."))
        }
    }

    port := os.Getenv("PORT")
    if port == "" {
        port = "3008"
    }
     logMessage(fmt.Sprintf("Server starting on port %s\n", port))
    router.Run(fmt.Sprintf(":%s", port))
}