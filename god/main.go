package main

import (
	// --- Standard library ---
	"context"        // Για timeouts και context propagation
	"crypto/md5"     // Για hashing (cache keys)
	"crypto/subtle"  // Για constant-time comparison (MCP auth)
	"fmt"            // Για formatted strings
	"io"             // Για το MultiWriter (logs)
	"log"            // Για logging
	"net/http"       // Για HTTP client (getUrl)
	"os"             // Για file operations και env vars
	"strings"        // Για string manipulation
	"time"           // Για timers

	// --- Third-party ---
	"github.com/gin-gonic/gin"            // Web framework
	"github.com/joho/godotenv"            // Φόρτωση .env
	"github.com/modelcontextprotocol/go-sdk/mcp" // MCP protocol

	// --- Internal ---
	"god/core"       // Core (Hub, Redis, Couch, PTY)
	"god/cubos"      // Cubos routes
	_ "god/cubos/chat"     // ✅ Side-effect import: καταχωρεί το chat cubo
	_ "god/cubos/terminal" // ✅ Side-effect import: καταχωρεί το terminal cubo (PTY)
)

// ============================================================
// GLOBALS
// ============================================================

var (
	logFile       *os.File          // Το αρχείο log
	logger        *log.Logger       // Ο logger (γράφει σε file + stdout)
	gredisInstance *core.Gredis     // Global Redis instance (για το getUrl)
)

// ============================================================
// HELPERS
// ============================================================

// GenerateCacheKey δημιουργεί ένα MD5 hash για ένα URL (cache key).
func GenerateCacheKey(url string) string {
	hash := md5.Sum([]byte(url))
	return fmt.Sprintf("%x", hash)
}

// ============================================================
// INIT (τρέχει πριν το main)
// ============================================================

func init() {
	var err error

	// 1. Ανοίγουμε το log file
	logFile, err = os.OpenFile(
		"/var/www/gs/data/gen20.net/god.txt",
		os.O_APPEND|os.O_CREATE|os.O_WRONLY,
		0644,
	)
	if err != nil {
		log.Fatalf("Failed to open log file: %v", err)
	}

	// 2. Δημιουργούμε τον logger (γράφει σε file + stdout)
	logger = log.New(
		io.MultiWriter(logFile, os.Stdout),
		"GOD: ",
		log.LstdFlags,
	)
}

// logMessage είναι wrapper για logging (αν το GOD_LOGGING_ENABLED=true).
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

// ============================================================
// HTTP HANDLERS
// ============================================================

// getUrl — φέρνει ένα URL και το κάνει cache στο Redis.
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

	// 1. Έλεγχος cache
	cacheKey := fmt.Sprintf("cubo_%s", GenerateCacheKey(url))
	cachedResponse, err := gredisInstance.Get(cacheKey)

	if err == nil && cachedResponse != "" {
		c.Data(http.StatusOK, "application/json", []byte(cachedResponse))
		return
	}

	// 2. Fetch από το URL
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

	// 3. Αποθήκευση στο cache
	jsonResponse := string(body)
	if err := gredisInstance.Set(cacheKey, jsonResponse, 3600); err != nil {
		logMessage(fmt.Sprintf("Error caching response: %v", err))
	}

	c.Data(http.StatusOK, "application/json", []byte(jsonResponse))
}

// ============================================================
// MCP ROUTES
// ============================================================

// registerMCPRoutes — καταχωρεί το MCP endpoint (αν υπάρχει token).
func registerMCPRoutes(router *gin.Engine) {
	token := os.Getenv("GEN20_MCP_TOKEN")

	if token == "" {
		logMessage("MCP disabled: GEN20_MCP_TOKEN is not configured")
		return
	}

	// 1. Δημιουργία MCP server
	server := mcp.NewServer(
		&mcp.Implementation{
			Name:    "gen20-mcp-bridge",
			Version: "0.1.0",
		},
		nil,
	)

	// 2. Προσθήκη tool "gen20_status"
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
				"god_reachable": resp.StatusCode >= 200 && resp.StatusCode < 500,
				"http_status":   resp.StatusCode,
			}, nil
		},
	)

	// 3. HTTP handler για MCP
	handler := mcp.NewStreamableHTTPHandler(
		func(r *http.Request) *mcp.Server {
			return server
		},
		&mcp.StreamableHTTPOptions{
			JSONResponse: true,
		},
	)

	// 4. Καταχώρηση route με auth
	router.Any("/mcp", func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		expected := "Bearer " + token

		if subtle.ConstantTimeCompare([]byte(auth), []byte(expected)) != 1 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		handler.ServeHTTP(c.Writer, c.Request)
	})
}

// ============================================================
// MAIN
// ============================================================

func main() {
	defer logFile.Close()

	// 1. Φόρτωση .env (αν υπάρχει)
	if err := godotenv.Load(); err != nil {
		logMessage("No .env file loaded; using system environment")
	}

	// 2. Δημιουργία Redis instance
	var err error
	gredisInstance, err = core.NewGredis()
	if err != nil {
		logMessage(fmt.Sprintf("Failed to create Gredis instance: %v", err))
	}

	// 3. Δημιουργία CouchDB instance
	couch, couchErr := core.NewGcouch()
	if couchErr != nil {
		logMessage(fmt.Sprintf("Failed to create Gcouch: %v", couchErr))
	} else {
		if err := couch.Bootstrap(); err != nil {
			logMessage(fmt.Sprintf("CouchDB bootstrap: %v", err))
		}
	}

	// 4. Έλεγχος αν τρέχουμε σε debug mode
	if gin.Mode() == gin.DebugMode {
		logMessage("WARNING: Gin running in debug mode")
	}

	// 5. Δημιουργία Hub (με Redis Pub/Sub)
	hub := core.NewHub(gredisInstance)
	if couch != nil {
		hub.SetCouch(couch)
	}

hub.Sol = core.NewSolBridge()

	go hub.Run() // Ξεκινάει το κεντρικό loop του Hub

	// 6. Δημιουργία Gin router
	router := gin.New()
	router.Use(gin.Recovery()) // Recovery από panics

// 6b. Sol bridge: endpoint /god/v1/sol/ws
	hub.Sol.Register(router)

	// 7. MCP routes (αν έχει token)
	registerMCPRoutes(router)

	// 8. Φόρτωση HTML templates (public/*.html)
	router.LoadHTMLGlob("public/*")

	// 9. Core routes (WebSocket, κ.λπ.)
	core.RegisterRoutes(router, hub)

	// 9b. Admin/system routes (hosts, bind, ssl, domain setup)
	core.Register(router, hub)

	// 10. Cubos routes (chat, κ.λπ.)
	cubos.RegisterAll(router, hub, couch)

	// 11. GOD v1 group
	v1 := router.Group("/god/v1")
	{
		// 11a. Galaxy UI (index.html)
		v1.GET("/", func(c *gin.Context) {
			c.HTML(http.StatusOK, "index.html", gin.H{
				"title": "GEN20 SOL",
			})
		})

		// 11b. API documentation UI
		v1.GET("/api.html", func(c *gin.Context) {
			var routeList []map[string]string

			for _, route := range router.Routes() {
				if strings.HasPrefix(route.Path, "/god/v1/") ||
					strings.HasPrefix(route.Path, "/mcp") {

					routeList = append(routeList, map[string]string{
						"Path":   route.Path,
						"Method": route.Method,
					})
				}
			}

			c.HTML(http.StatusOK, "api.html", gin.H{
				"title":  "GOD API",
				"routes": routeList,
			})
		})

		// 11c. JSON routes endpoint
		v1.GET("/routes", func(c *gin.Context) {
			var list []map[string]string

			for _, route := range router.Routes() {
				if strings.HasPrefix(route.Path, "/god/v1/") ||
					strings.HasPrefix(route.Path, "/mcp") {

					list = append(list, map[string]string{
						"path":   route.Path,
						"method": route.Method,
					})
				}
			}

			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"routes":  list,
			})
		})

		// 11d. URL fetcher (με cache)
		v1.GET("/getUrl", getUrl)
	}

	// 12. Εκκίνηση server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3008"
	}

	logMessage(fmt.Sprintf("Server starting on port %s", port))

	if err := router.Run(":" + port); err != nil {
		logMessage(fmt.Sprintf("GOD server stopped: %v", err))
	}
}