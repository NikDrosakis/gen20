package main

import (
	"strings"
	"context"
	"crypto/md5"
	"crypto/subtle"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/modelcontextprotocol/go-sdk/mcp"

"god/api"          // ← ΝΕΟ
    "god/core"
    "god/services/messaging"
	"god/services/mermaid"
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
}

func logMessage(message string) {
	if logger == nil {
		log.Println(message)
		return
	}

	if os.Getenv("GOD_LOGGING_ENABLED") == "true" {
		logger.Println(message)
	} else {
		logger.Output(2, message)
	}
}

func getUrl(c *gin.Context) {
	url := c.DefaultQuery("url", "")

	if url == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "URL parameter is required",
		})
		return
	}

	if gredisInstance == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Redis is unavailable",
		})
		return
	}

	cacheKey := fmt.Sprintf(
		"cubo_%s",
		GenerateCacheKey(url),
	)

	cachedResponse, err := gredisInstance.Get(cacheKey)

	if err == nil && cachedResponse != "" {
		c.Data(
			http.StatusOK,
			"application/json",
			[]byte(cachedResponse),
		)
		return
	}

	resp, err := http.Get(url)

	if err != nil {
		logMessage(fmt.Sprintf("Error fetching URL: %v", err))

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch URL",
		})
		return
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		logMessage(fmt.Sprintf("Error reading body: %v", err))

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read response body",
		})
		return
	}

	jsonResponse := string(body)

	err = gredisInstance.Set(cacheKey, jsonResponse, 3600)

	if err != nil {
		logMessage(fmt.Sprintf("Error caching response: %v", err))
	}

	c.Data(
		http.StatusOK,
		"application/json",
		[]byte(jsonResponse),
	)
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

			client := &http.Client{
				Timeout: 3 * time.Second,
			}

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
			c.AbortWithStatusJSON(
				http.StatusUnauthorized,
				gin.H{
					"error": "Unauthorized",
				},
			)
			return
		}

		handler.ServeHTTP(c.Writer, c.Request)
	})
}

func main() {
	defer logFile.Close()

	// Load environment before initializing services.
	if err := godotenv.Load(); err != nil {
		logMessage("No .env file loaded; using system environment")
	}

	// Initialize Redis after environment loading.
	var err error

	gredisInstance, err = core.NewGredis()

	if err != nil {
		logMessage(fmt.Sprintf(
			"Failed to create Gredis instance: %v",
			err,
		))
	}

	if gin.Mode() == gin.DebugMode {
		logMessage("WARNING: Gin running in debug mode")
	}

    hub := core.NewHub()
	go hub.Run()

	router := gin.Default()
	registerMCPRoutes(router)
	router.LoadHTMLGlob("public/*")
	mermaid.RegisterRoutes(router)
	messaging.RegisterRoutes(router, hub)

 // ✅ ΟΛΑ τα /god/v1/* endpoints
    api.Register(router)

	v1 := router.Group("/god/v1")
	{
		v1.GET("/", func(c *gin.Context) {
			routes := router.Routes()

			var routeList []map[string]string

			for _, route := range routes {
				routeList = append(
					routeList,
					map[string]string{
						"Path":   route.Path,
						"Method": route.Method,
					},
				)
			}

			c.HTML(
				http.StatusOK,
				"index.html",
				gin.H{
					"title":     "God Gin App Landing Page",
					"endpoints": routeList,
				},
			)
		})
    v1.GET("/routes", func(c *gin.Context) {
        routes := router.Routes()
        var list []map[string]string
        for _, r := range routes {
            if strings.HasPrefix(r.Path, "/god/v1/") || strings.HasPrefix(r.Path, "/mcp") {
                list = append(list, map[string]string{
                    "path":   r.Path,
                    "method": r.Method,
                })
            }
        }
        c.JSON(200, gin.H{"success": true, "routes": list})
    })
		v1.GET("/getUrl", getUrl)
		// Interactive terminal backed by PTY.
		v1.GET("/ws", terminalWS)
	}

	port := os.Getenv("PORT")

	if port == "" {
		port = "3008"
	}

	logMessage(fmt.Sprintf(
		"Server starting on port %s",
		port,
	))

	if err := router.Run(":" + port); err != nil {
		logMessage(fmt.Sprintf("GOD server stopped: %v", err))
	}
}
